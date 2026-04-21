import { useState, useCallback, useRef } from 'react';
import { sendChatMessage, resetSession } from '../services/api';

export default function useChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followUpSuggestions, setFollowUpSuggestions] = useState([]);
  const sessionIdRef = useRef(crypto.randomUUID());

  const sendMessage = useCallback(async (text, fileId) => {
    if (!text.trim() || !fileId || loading) return;

    setFollowUpSuggestions([]);

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
    };

    const loadingMsg = {
      id: Date.now() + 1,
      role: 'assistant',
      loading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setLoading(true);

    try {
      const result = await sendChatMessage(text, fileId, sessionIdRef.current);

      const aiMsg = {
        id: Date.now() + 2,
        role: 'assistant',
        content: result.answer || 'Analysis complete, but no summary was generated.',
        code: result.code || '',
        chartPath: result.chart_path || '',
        executionResult: result.execution_result || '',
      };

      setMessages((prev) =>
        prev.filter((m) => !m.loading).concat(aiMsg)
      );

      if (result.follow_up_suggestions?.length) {
        setFollowUpSuggestions(result.follow_up_suggestions);
      }
    } catch (err) {
      let errorText = 'Something went wrong. Please try again.';
      if (err.code === 'ECONNABORTED') {
        errorText = 'The request timed out. Try a simpler question or a smaller dataset.';
      } else if (err.response?.status === 500) {
        errorText = err.response.data?.detail || 'Server error. Please restart the backend and try again.';
      } else if (err.response?.data?.detail) {
        errorText = err.response.data.detail;
      } else if (!err.response) {
        errorText = 'Cannot reach the server. Make sure the backend is running on port 8001.';
      }

      const errorMsg = {
        id: Date.now() + 3,
        role: 'assistant',
        content: errorText,
        isError: true,
      };

      setMessages((prev) =>
        prev.filter((m) => !m.loading).concat(errorMsg)
      );
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const clearMessages = useCallback(async () => {
    const oldSessionId = sessionIdRef.current;
    sessionIdRef.current = crypto.randomUUID();
    setMessages([]);
    setFollowUpSuggestions([]);

    try {
      await resetSession(oldSessionId);
    } catch {
      // best-effort cleanup
    }
  }, []);

  return { messages, loading, followUpSuggestions, sendMessage, clearMessages };
}
