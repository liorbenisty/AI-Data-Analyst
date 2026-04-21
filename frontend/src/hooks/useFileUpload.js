import { useState, useCallback } from 'react';
import { uploadFile, listFiles } from '../services/api';

export default function useFileUpload() {
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = useCallback(async (file) => {
    setUploading(true);
    setError('');
    try {
      const result = await uploadFile(file);
      const newFile = {
        file_id: result.file_id,
        original_name: result.original_name,
        size_bytes: result.size_bytes,
        schema: result.schema,
      };
      setFiles((prev) => [newFile, ...prev]);
      setActiveFile(newFile);
      return newFile;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Upload failed';
      setError(msg);
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  const loadFiles = useCallback(async () => {
    try {
      const result = await listFiles();
      setFiles(result.files || []);
      if (result.files?.length > 0 && !activeFile) {
        setActiveFile(result.files[0]);
      }
    } catch {
      // ignore
    }
  }, [activeFile]);

  return {
    files,
    activeFile,
    setActiveFile,
    uploading,
    error,
    handleUpload,
    loadFiles,
  };
}
