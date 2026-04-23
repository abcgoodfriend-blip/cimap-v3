import axios from "axios";
import { getMockData } from "./mockData";

const API_URL = process.env.REACT_APP_API_URL || "https://adani-backend-h3ij.onrender.com/api";
const LOCAL_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 12000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("osint_token");
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * safeFetch: try the external API; on any failure, return mock data.
 * Ensures the dashboard always stays populated for demos.
 */
export async function safeFetch(path, { params = {}, mockKey = null } = {}) {
  try {
    const res = await apiClient.get(path, { params });
    return { data: res.data, source: "live" };
  } catch (err) {
    const fallback = getMockData(mockKey || path, params);
    return { data: fallback, source: "mock", error: err?.message };
  }
}

export async function loginExternal(email, password) {
  try {
    const res = await apiClient.post("/auth/login", { email, password });
    return { ok: true, data: res.data, source: "live" };
  } catch (err) {
    return { ok: false, error: err?.response?.data?.detail || err.message };
  }
}

export async function fetchMe() {
  try {
    const res = await apiClient.get("/auth/me");
    return { ok: true, data: res.data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function exportPosts(params = {}) {
  const token = localStorage.getItem("osint_token");
  const qs = new URLSearchParams({ ...params, access_token: token || "" }).toString();
  window.open(`${API_URL}/posts/export?${qs}`, "_blank");
}

export async function aiChat(message, sessionId) {
  const token = localStorage.getItem("osint_token");
  // Try external directly first (if real backend)
  try {
    const res = await apiClient.post(
      "/chat/analyst",
      { message, session_id: sessionId },
      { timeout: 18000 }
    );
    const data = res.data;
    const text = typeof data === "string" ? data : data.response || data.reply || JSON.stringify(data);
    return { response: text, source: "external" };
  } catch (e) {
    // fallback to local proxy which has emergent LLM
    try {
      const res = await axios.post(
        `${LOCAL_URL}/ai/chat`,
        { message, session_id: sessionId, token: token || null },
        { timeout: 25000 }
      );
      return { response: res.data.response, source: res.data.source };
    } catch (e2) {
      return {
        response:
          "AI Analyst currently unreachable. Please retry shortly.\n\nTip: when live, I correlate signals, narrative clusters and geographic risk.",
        source: "offline",
      };
    }
  }
}

export { API_URL, LOCAL_URL };
