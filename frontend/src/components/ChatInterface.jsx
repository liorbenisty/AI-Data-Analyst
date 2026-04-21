import { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Fade from '@mui/material/Fade';
import Grow from '@mui/material/Grow';
import SendIcon from '@mui/icons-material/Send';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import MessageBubble from './MessageBubble';

const SUGGESTIONS = [
  'Show me a summary of the dataset',
  'What are the top 5 rows by revenue?',
  'Create a bar chart of revenue by category',
  'Show the trend over time',
];

function AnimatedMessage({ children, index }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), Math.min(index * 60, 300));
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <Grow in={show} timeout={400}>
      <div>{children}</div>
    </Grow>
  );
}

export default function ChatInterface({ messages, loading, onSend, activeFile }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || loading || !activeFile) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ flex: 1, overflow: 'auto', px: 3, py: 2 }}>
        {messages.length === 0 ? (
          <Fade in timeout={600}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 3,
              }}
            >
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: (t) =>
                    t.palette.mode === 'dark'
                      ? 'rgba(41, 151, 255, 0.12)'
                      : 'rgba(0, 113, 227, 0.08)',
                }}
              >
                <AutoGraphIcon sx={{ fontSize: 36, color: 'primary.main' }} />
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom>
                  {activeFile
                    ? 'Ask a question about your data'
                    : 'Upload a dataset to get started'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                  {activeFile
                    ? `Analyzing: ${activeFile.original_name} (${activeFile.schema?.row_count} rows, ${activeFile.schema?.column_count} columns)`
                    : 'Drop a CSV or Excel file above to begin your analysis'}
                </Typography>
              </Box>
              {activeFile && (
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    justifyContent: 'center',
                    maxWidth: 520,
                  }}
                >
                  {SUGGESTIONS.map((s, i) => (
                    <Grow key={s} in timeout={400 + i * 100}>
                      <Box
                        onClick={() => setInput(s)}
                        sx={{
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          border: 1,
                          borderColor: 'divider',
                          cursor: 'pointer',
                          fontSize: '0.8125rem',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: 'action.hover',
                            transform: 'translateY(-1px)',
                          },
                        }}
                      >
                        {s}
                      </Box>
                    </Grow>
                  ))}
                </Box>
              )}
            </Box>
          </Fade>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <AnimatedMessage key={msg.id} index={idx}>
                <MessageBubble message={msg} />
              </AnimatedMessage>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      <Box sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
        {!activeFile && (
          <Typography
            variant="caption"
            color="warning.main"
            sx={{ display: 'block', mb: 1, textAlign: 'center' }}
          >
            Upload a file first to start chatting
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder={
              activeFile
                ? 'Ask a question about your data...'
                : 'Upload a file first...'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!activeFile || loading}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: 'action.hover',
              },
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!input.trim() || loading || !activeFile}
            color="primary"
            sx={{
              bgcolor: 'primary.main',
              color: '#fff',
              width: 40,
              height: 40,
              transition: 'all 0.2s ease',
              '&:hover': { bgcolor: 'primary.dark', transform: 'scale(1.05)' },
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground',
                color: 'action.disabled',
              },
            }}
          >
            <SendIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
