import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Fade from '@mui/material/Fade';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TableChartIcon from '@mui/icons-material/TableChart';

export default function FileUpload({ onUpload, uploading, activeFile, error }) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) onUpload(file);
    },
    [onUpload]
  );

  const handleFileSelect = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (file) onUpload(file);
    },
    [onUpload]
  );

  if (activeFile) {
    return (
      <Fade in timeout={300}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1,
            borderRadius: 2,
            bgcolor: (t) =>
              t.palette.mode === 'dark'
                ? 'rgba(48, 209, 88, 0.08)'
                : 'rgba(52, 199, 89, 0.06)',
            border: 1,
            borderColor: (t) =>
              t.palette.mode === 'dark'
                ? 'rgba(48, 209, 88, 0.2)'
                : 'rgba(52, 199, 89, 0.15)',
          }}
        >
          <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
          <TableChartIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
              {activeFile.original_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {activeFile.schema?.row_count} rows &middot; {activeFile.schema?.column_count} columns
            </Typography>
          </Box>
          <Button
            size="small"
            component="label"
            variant="outlined"
            sx={{
              minWidth: 'auto',
              fontSize: '0.75rem',
              borderRadius: 1.5,
              textTransform: 'none',
            }}
          >
            Change file
            <input
              type="file"
              hidden
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
            />
          </Button>
        </Box>
      </Fade>
    );
  }

  return (
    <Box
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      sx={{
        border: 2,
        borderStyle: 'dashed',
        borderColor: dragOver ? 'primary.main' : 'divider',
        borderRadius: 3,
        p: 4,
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        bgcolor: dragOver ? 'action.hover' : 'transparent',
        '&:hover': {
          borderColor: 'primary.light',
          bgcolor: 'action.hover',
          transform: 'translateY(-1px)',
        },
      }}
      component="label"
    >
      {uploading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary">
            Processing file...
          </Typography>
        </Box>
      ) : (
        <>
          <CloudUploadIcon
            sx={{ fontSize: 48, color: 'primary.main', mb: 1, opacity: 0.8 }}
          />
          <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
            Drop your file here or click to browse
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Supports CSV, XLS, XLSX (max 50 MB)
          </Typography>
          <Box
            sx={{ mt: 1.5, display: 'flex', gap: 1, justifyContent: 'center' }}
          >
            <Chip label=".csv" size="small" variant="outlined" />
            <Chip label=".xlsx" size="small" variant="outlined" />
            <Chip label=".xls" size="small" variant="outlined" />
          </Box>
        </>
      )}
      <input
        type="file"
        hidden
        accept=".csv,.xlsx,.xls"
        onChange={handleFileSelect}
      />
      {error && (
        <Typography variant="body2" color="error" sx={{ mt: 1.5 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
