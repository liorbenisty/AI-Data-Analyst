import { useState, useEffect, useCallback } from 'react';
import { healthCheck } from '../services/api';

export default function useBackendStatus() {
  const [status, setStatus] = useState('checking');
  const [mistralConfigured, setMistralConfigured] = useState(false);

  const check = useCallback(async () => {
    try {
      const data = await healthCheck();
      setStatus('connected');
      setMistralConfigured(data.mistral_configured ?? false);
    } catch {
      setStatus('disconnected');
      setMistralConfigured(false);
    }
  }, []);

  useEffect(() => {
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [check]);

  return { status, mistralConfigured, recheck: check };
}
