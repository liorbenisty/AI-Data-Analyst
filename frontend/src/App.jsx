import { useState, useMemo, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { createAppTheme } from './theme/theme';
import FileUpload from './components/FileUpload';
import ChatInterface from './components/ChatInterface';
import useFileUpload from './hooks/useFileUpload';
import useChat from './hooks/useChat';
import useBackendStatus from './hooks/useBackendStatus';

function StatusDot({ status, mistralConfigured }) {
  const color =
    status === 'connected' && mistralConfigured
      ? '#30d158'
      : status === 'connected'
        ? '#ff9f0a'
        : status === 'disconnected'
          ? '#ff453a'
          : '#86868b';

  const label =
    status === 'connected' && mistralConfigured
      ? 'Backend connected'
      : status === 'connected'
        ? 'Backend connected — API key missing'
        : status === 'disconnected'
          ? 'Backend offline'
          : 'Checking...';

  return (
    <Tooltip title={label} arrow>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: color,
          boxShadow: `0 0 6px ${color}`,
          transition: 'background-color 0.3s ease',
        }}
      />
    </Tooltip>
  );
}

function App() {
  const [mode, setMode] = useState('dark');
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const {
    activeFile,
    uploading,
    error: uploadError,
    handleUpload,
    loadFiles,
  } = useFileUpload();

  const { messages, loading, sendMessage, clearMessages } = useChat();
  const { status, mistralConfigured } = useBackendStatus();

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    if (status === 'disconnected') {
      setSnackbar({
        open: true,
        message: 'Cannot reach the backend server. Make sure it is running on port 8000.',
        severity: 'error',
      });
    } else if (status === 'connected' && !mistralConfigured) {
      setSnackbar({
        open: true,
        message: 'Mistral API key is not configured. Update backend/.env and restart the server.',
        severity: 'warning',
      });
    }
  }, [status, mistralConfigured]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSend = (text) => {
    if (activeFile) {
      sendMessage(text, activeFile.file_id);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Box
          component="header"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: 1.5,
            borderBottom: 1,
            borderColor: 'divider',
            backdropFilter: 'blur(20px)',
            bgcolor:
              mode === 'dark'
                ? 'rgba(28, 28, 30, 0.8)'
                : 'rgba(255, 255, 255, 0.8)',
            zIndex: 10,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AutoGraphIcon sx={{ color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              AI Data Analyst
            </Typography>
            <StatusDot status={status} mistralConfigured={mistralConfigured} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {messages.length > 0 && (
              <Tooltip title="Clear chat" arrow>
                <IconButton onClick={clearMessages} color="inherit" size="small">
                  <DeleteOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'} arrow>
              <IconButton onClick={toggleTheme} color="inherit" size="small">
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ px: 3, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <FileUpload
            onUpload={handleUpload}
            uploading={uploading}
            activeFile={activeFile}
            error={uploadError}
          />
        </Box>

        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <ChatInterface
            messages={messages}
            loading={loading}
            onSend={handleSend}
            activeFile={activeFile}
          />
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={8000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
