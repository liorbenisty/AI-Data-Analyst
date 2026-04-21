import { useState, useEffect } from 'react';
import { fetchFilePreview } from '../services/api';

export default function useDataPreview(fileId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!fileId) {
      setData(null);
      setError('');
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    setError('');
    setData(null);

    fetchFilePreview(fileId, 50, controller.signal)
      .then((payload) => {
        setData(payload);
      })
      .catch((err) => {
        if (err.code === 'ERR_CANCELED' || err.name === 'CanceledError') return;
        const msg =
          err.response?.data?.detail ||
          (err.response?.status === 404 ? 'File not found' : 'Could not load preview');
        setError(typeof msg === 'string' ? msg : 'Could not load preview');
        setData(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [fileId]);

  return { data, loading, error };
}
