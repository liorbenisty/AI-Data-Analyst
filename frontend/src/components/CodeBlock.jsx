import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckIcon from '@mui/icons-material/Check';
import CodeIcon from '@mui/icons-material/Code';

export default function CodeBlock({ code, label = 'Generated Code' }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!code) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box sx={{ mt: 1.5, borderRadius: 2, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 0.75,
          cursor: 'pointer',
          bgcolor: 'action.hover',
          '&:hover': { bgcolor: 'action.selected' },
        }}
      >
        <CodeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography variant="caption" sx={{ flex: 1, fontWeight: 500, color: 'text.secondary' }}>
          {label}
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); handleCopy(); }}
          sx={{ p: 0.25 }}
        >
          {copied ? (
            <CheckIcon sx={{ fontSize: 14, color: 'success.main' }} />
          ) : (
            <ContentCopyIcon sx={{ fontSize: 14 }} />
          )}
        </IconButton>
        {expanded ? (
          <ExpandLessIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
        ) : (
          <ExpandMoreIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
        )}
      </Box>
      <Collapse in={expanded}>
        <Box
          component="pre"
          sx={{
            m: 0,
            p: 2,
            overflow: 'auto',
            fontSize: '0.8rem',
            fontFamily: '"SF Mono", "Fira Code", "Consolas", monospace',
            lineHeight: 1.6,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? '#0d0d0d' : '#f8f8f8',
            color: 'text.primary',
            maxHeight: 300,
          }}
        >
          <code>{code}</code>
        </Box>
      </Collapse>
    </Box>
  );
}
