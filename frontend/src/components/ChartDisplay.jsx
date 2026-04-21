import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export default function ChartDisplay({ chartPath }) {
  if (!chartPath) return null;

  const chartUrl = `/charts/${chartPath}`;

  return (
    <Box
      sx={{
        mt: 2,
        borderRadius: 2,
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: 0.5,
          bgcolor: 'action.hover',
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          Chart
        </Typography>
        <IconButton
          size="small"
          href={chartUrl}
          target="_blank"
          sx={{ p: 0.25 }}
        >
          <OpenInNewIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>
      <Box
        component="img"
        src={chartUrl}
        alt="Generated chart"
        sx={{
          width: '100%',
          maxHeight: 450,
          objectFit: 'contain',
          display: 'block',
          bgcolor: '#ffffff',
        }}
      />
    </Box>
  );
}
