import axios from "axios";

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const client = axios.create({ baseURL: API, timeout: 60000 });

export const fetchServices = async () => {
  const res = await client.get("/services");
  return res.data.services;
};

export const simplifyService = async (serviceKey, language) => {
  const res = await client.post("/services/simplify", {
    service_key: serviceKey,
    language,
  });
  return res.data;
};

export const analyzeIssueImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await client.post("/issues/analyze-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 90000,
  });
  return res.data;
};

export const createIssue = async (payload) => {
  const res = await client.post("/issues/create", payload);
  return res.data;
};

export const getIssue = async (trackingId) => {
  const res = await client.get(`/issues/${encodeURIComponent(trackingId)}`);
  return res.data;
};

export const getChatHistory = async (sessionId) => {
  const res = await client.get(`/chat/history/${sessionId}`);
  return res.data;
};

// Streaming chat over SSE-style fetch
export const streamChat = async ({ sessionId, message, language, onDelta, onDone, onError }) => {
  try {
    const resp = await fetch(`${API}/chat/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, message, language }),
    });
    if (!resp.ok || !resp.body) {
      throw new Error(`Request failed (${resp.status})`);
    }
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let doneReceived = false;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop();
      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith("data: ")) continue;
        let data;
        try {
          data = JSON.parse(line.slice(6));
        } catch {
          continue;
        }
        if (data.type === "delta") onDelta?.(data.text);
        else if (data.type === "done") {
          doneReceived = true;
          onDone?.(data.message);
        } else if (data.type === "error") {
          doneReceived = true;
          onError?.(data.detail || "Something went wrong");
        }
      }
    }
    if (!doneReceived) onError?.("Connection interrupted. Please try again.");
  } catch (e) {
    onError?.(e.message || "Network error");
  }
};
