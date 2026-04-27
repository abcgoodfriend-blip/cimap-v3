import os
import json
import logging
import requests
from datetime import datetime, timezone
import shutil
from pathlib import Path

# --- Configuration ---
BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000/api/ingest/posts")
INGEST_API_KEY = "4d270df919e95630e697c6fe62e74d79"
DATA_DIR = Path(".")
LOG_FILE = "ingestor.log"

# --- Setup Logging ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("CIMAP_Ingestor")

def map_twitter(data):
    posts = []
    for item in data:
        posts.append({
            "platform": "twitter",
            "author": item.get("handle", "Unknown"),
            "handle": item.get("handle", "@unknown"),
            "content": item.get("text", ""),
            "url": item.get("url", ""),
            "created_at": item.get("timestamp", datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")),
            "likes": 0, "shares": 0, "comments": 0
        })
    return posts

def map_youtube(data):
    posts = []
    for item in data:
        # Professional fallback for author name
        channel = item.get('channel')
        if not channel or channel == "Unknown":
            url_part = item.get('url', 'YouTube').split("/")[-1]
            channel = url_part.replace("@", "").replace("_", " ").title() if url_part else "YouTube Intel"

        # Combine title and transcript if available
        title = item.get('title', '')
        transcript = item.get('transcript', '')
        content = f"{title}\n\nTranscript: {transcript[:500]}..." if transcript else title

        # Prioritize video_id for the canonical URL
        video_id = item.get("video_id")
        canonical_url = f"https://www.youtube.com/watch?v={video_id}" if video_id else item.get("url", "")

        posts.append({
            "platform": "youtube",
            "author": channel,
            "handle": item.get("channel_url", "YouTube"),
            "content": content,
            "url": canonical_url,
            "created_at": item.get("calculated_timestamp", item.get("scraped_at", datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M"))),
        })
    return posts

def map_reddit(data):
    posts = []
    for item in data:
        content = f"[{item.get('subreddit', 'Reddit')}] {item.get('title', '')}\n{item.get('content', '')}"
        posts.append({
            "platform": "reddit",
            "author": item.get("author", "Unknown"),
            "handle": f"u/{item.get('author', 'anonymous')}",
            "content": content,
            "url": item.get("post_link", ""),
            "created_at": item.get("timestamp", datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")),
        })
    return posts

def map_linkedin(data):
    posts = []
    for item in data:
        name = item.get("author_name")
        if not name or name == "Unknown":
            # Extract from profile link
            link = item.get("author_link", "")
            if "/in/" in link:
                name = link.split("/in/")[-1].strip("/").replace("-", " ").title()
            else:
                name = "LinkedIn Analyst"

        posts.append({
            "platform": "linkedin",
            "author": name,
            "handle": "LinkedIn Professional",
            "content": item.get("content", ""),
            "url": item.get("post_link", ""),
            "created_at": item.get("calculated_timestamp", datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")),
        })
    return posts

def map_instagram(data):
    posts = []
    for handle, profile in data.items():
        for post in profile.get("posts", []):
            posts.append({
                "platform": "instagram",
                "author": handle,
                "handle": f"@{handle}",
                "content": post.get("caption", ""),
                "url": post.get("url", ""),
                "created_at": post.get("timestamp", datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")),
            })
    return posts

def map_facebook(data):
    posts = []
    for item in data:
        # In clean_posts.json (Facebook), the unique field is 'post_url'
        posts.append({
            "platform": "facebook",
            "author": item.get("account_name", "Unknown"),
            "handle": item.get("account_url", "Facebook").split("/")[-1] or "FB",
            "content": item.get("text", ""),
            "url": item.get("post_url", ""),
            "created_at": item.get("posted_at", datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")),
        })
    return posts

def push_to_backend(posts):
    if not posts:
        return
    
    headers = {
        "X-API-Key": INGEST_API_KEY,
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(BACKEND_URL, json=posts, headers=headers, timeout=180)
        if response.status_code == 200:
            logger.info(f"Successfully ingested {len(posts)} posts.")
            return True
        else:
            logger.error(f"Ingestion failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        logger.error(f"Request failed: {e}")
        return False

def run_ingestion():
    logger.info("Starting professional ingestion cycle...")
    
    mapping_config = {
        "twitter_search_*.json": map_twitter,
        "youtube_*.json": map_youtube,
        "reddit_posts.json": map_reddit,
        "linkedin_posts.json": map_linkedin,
        f"{datetime.now().strftime('%Y-%m-%d')}*.json": map_instagram, # Dynamic Instagram glob
        "clean_posts.json": map_facebook # Corrected to use map_facebook
    }

    
    all_posts = []
    processed_files = []

    for pattern, adapter in mapping_config.items():
        for file_path in DATA_DIR.glob(pattern):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    mapped = adapter(data)
                    all_posts.extend(mapped)
                    processed_files.append(file_path)
                    logger.info(f"Mapped {len(mapped)} items from {file_path.name}")
            except Exception as e:
                logger.error(f"Error processing {file_path.name}: {e}")

    if all_posts:
        # Batching for performance (e.g., 50 at a time)
        BATCH_SIZE = 5
        success = True
        for i in range(0, len(all_posts), BATCH_SIZE):
            batch = all_posts[i:i + BATCH_SIZE]
            if not push_to_backend(batch):
                success = False
        
        if success:
            # Delete files after successful ingestion
            for f in processed_files:
                try:
                    f.unlink()
                    logger.info(f"Deleted processed file: {f.name}")
                except Exception as e:
                    logger.error(f"Failed to delete {f.name}: {e}")
    else:
        logger.info("No new data found for ingestion.")

import time

def start_daemon():
    logger.info("CIMAP Orchestrator starting in DAEMON mode (30-minute cycles)...")
    while True:
        try:
            logger.info(f"--- Starting Ingestion Cycle: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ---")
            run_ingestion()
            logger.info("--- Cycle Complete. Sleeping for 30 minutes. ---")
        except Exception as e:
            logger.critical(f"Daemon Loop Encountered Fatal Error: {e}")
            logger.info("Retrying in 60 seconds...")
            time.sleep(60)
            continue
            
        time.sleep(30 * 60) # 30 minutes

if __name__ == "__main__":
    import sys
    if "--daemon" in sys.argv:
        start_daemon()
    else:
        run_ingestion()
