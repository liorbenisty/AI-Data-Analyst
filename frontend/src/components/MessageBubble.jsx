import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import PersonIcon from '@mui/icons-material/Person';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import CodeBlock from './CodeBlock';
import ChartDisplay from './ChartDisplay';

function formatMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.*$)/gm, '<h4>$1</h4>')
    .replace(/^## (.*$)/gm, '<h3>$1</h3>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n{2,}/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  if (message.loading) {
    return (
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, alignItems: 'flex-start' }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
          <AutoGraphIcon sx={{ fontSize: 18 }} />
        </Avatar>
        <Box sx={{ maxWidth: '75%' }}>
          <Box
            sx={{
              px: 2.5,
              py: 2,
              borderRadius: 2.5,
              borderTopLeftRadius: 4,
              bgcolor: 'action.hover',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <CircularProgress size={16} thickness={5} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Analyzing your data...
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              This may take up to 2 minutes depending on the complexity
            </Typography>
            <LinearProgress
              sx={{ mt: 1.5, borderRadius: 1, height: 3, opacity: 0.6 }}
            />
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        mb: 3,
        alignItems: 'flex-start',
        flexDirection: isUser ? 'row-reverse' : 'row',
      }}
    >
      <Avatar
        sx={{
          bgcolor: isUser
            ? 'secondary.main'
            : message.isError
              ? 'error.main'
              : 'primary.main',
          width: 32,
          height: 32,
        }}
      >
        {isUser ? (
          <PersonIcon sx={{ fontSize: 18 }} />
        ) : message.isError ? (
          <ErrorOutlineIcon sx={{ fontSize: 18 }} />
        ) : (
          <AutoGraphIcon sx={{ fontSize: 18 }} />
        )}
      </Avatar>

      <Box sx={{ maxWidth: '75%', minWidth: 0 }}>
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            borderRadius: 2.5,
            bgcolor: isUser
              ? 'primary.main'
              : message.isError
                ? (theme) => theme.palette.mode === 'dark' ? 'rgba(255,69,58,0.12)' : 'rgba(255,59,48,0.08)'
                : 'action.hover',
            color: isUser ? '#ffffff' : 'text.primary',
            borderTopRightRadius: isUser ? 4 : undefined,
            borderTopLeftRadius: isUser ? undefined : 4,
            border: message.isError ? 1 : 0,
            borderColor: message.isError ? 'error.main' : 'transparent',
          }}
        >
          <Typography
            variant="body1"
            component="div"
            sx={{
              '& h3, & h4': { mt: 1, mb: 0.5, fontSize: '0.95rem' },
              '& ul': { pl: 2, my: 0.5 },
              '& li': { mb: 0.25 },
              '& strong': { fontWeight: 600 },
            }}
            dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }}
          />
        </Box>

        {!isUser && message.chartPath && (
          <ChartDisplay chartPath={message.chartPath} />
        )}

        {!isUser && message.code && (
          <CodeBlock code={message.code} />
        )}

        {!isUser && message.executionResult && (
          <CodeBlock code={message.executionResult} label="Output" />
        )}
      </Box>
    </Box>
  );
}
