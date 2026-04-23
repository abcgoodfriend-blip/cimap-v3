import { mockWebSocketEvent } from "./mockData";

const WS_URL = process.env.REACT_APP_WS_URL || "wss://adani-backend-h3ij.onrender.com/ws/dashboard";

export function connectDashboardWS({ onMessage, onOpen, onClose }) {
  let ws = null;
  let mockInterval = null;
  let closed = false;
  let isMock = false;

  const startMock = () => {
    isMock = true;
    if (onOpen) onOpen({ mock: true });
    mockInterval = setInterval(() => {
      const evt = mockWebSocketEvent();
      onMessage && onMessage(evt);
    }, 4000);
  };

  try {
    ws = new WebSocket(WS_URL);
    const timeout = setTimeout(() => {
      if (ws && ws.readyState !== WebSocket.OPEN) {
        try { ws.close(); } catch (e) { /* noop */ }
        startMock();
      }
    }, 3500);

    ws.onopen = () => {
      clearTimeout(timeout);
      if (onOpen) onOpen({ mock: false });
    };
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        onMessage && onMessage(data);
      } catch (err) {
        // raw data
        onMessage && onMessage({ event: "RAW", payload: e.data });
      }
    };
    ws.onerror = () => { /* will retry via close */ };
    ws.onclose = () => {
      if (!closed && !isMock) {
        startMock();
      }
      if (onClose) onClose();
    };
  } catch (e) {
    startMock();
  }

  return {
    close: () => {
      closed = true;
      if (mockInterval) clearInterval(mockInterval);
      if (ws && ws.readyState === WebSocket.OPEN) ws.close();
    },
    isMock: () => isMock,
  };
}
