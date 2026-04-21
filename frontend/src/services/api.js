import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 180000,
});

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return response.data;
};

export const listFiles = async () => {
  const response = await api.get('/files');
  return response.data;
};

export const fetchFilePreview = async (fileId, limit = 50, signal) => {
  const response = await api.get(`/files/${encodeURIComponent(fileId)}/preview`, {
    params: { limit },
    signal,
    timeout: 60000,
  });
  return response.data;
};

export const sendChatMessage = async (message, fileId, sessionId) => {
  const response = await api.post('/chat', {
    message,
    file_id: fileId,
    session_id: sessionId || '',
  });
  return response.data;
};

export const resetSession = async (sessionId) => {
  const response = await api.post('/chat/reset', { session_id: sessionId });
  return response.data;
};

export const healthCheck = async () => {
  const response = await api.get('/health', { timeout: 5000 });
  return response.data;
};

export default api;
