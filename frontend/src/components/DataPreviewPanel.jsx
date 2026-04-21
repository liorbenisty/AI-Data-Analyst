import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import useDataPreview from '../hooks/useDataPreview';

const CELL_MAX = 120;

function CellValue({ value }) {
  const str =
    value === null || value === undefined
      ? ''
      : typeof value === 'object'
        ? JSON.stringify(value)
        : String(value);
  const truncated = str.length > CELL_MAX;
  const display = truncated ? `${str.slice(0, CELL_MAX)}…` : str;

  if (!str) {
    return (
      <Typography component="span" variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
        —
      </Typography>
    );
  }

  if (truncated) {
    return (
      <Tooltip title={str} placement="top" enterDelay={400}>
        <Typography component="span" variant="body2" sx={{ whiteSpace: 'nowrap' }}>
          {display}
        </Typography>
      </Tooltip>
    );
  }

  return (
    <Typography component="span" variant="body2" sx={{ whiteSpace: 'nowrap' }}>
      {display}
    </Typography>
  );
}

export default function DataPreviewPanel({ activeFile }) {
  const fileId = activeFile?.file_id;
  const { data, loading, error } = useDataPreview(fileId);
  const [expanded, setExpanded] = useState(true);

  const columns = data?.columns ?? activeFile?.schema?.columns ?? activeFile?.columns ?? [];
  const dtypes = data?.dtypes ?? activeFile?.schema?.dtypes ?? {};
  const nullCounts = data?.null_counts ?? activeFile?.schema?.null_counts ?? {};
  const totalRows =
    data?.total_row_count ?? activeFile?.schema?.row_count ?? activeFile?.row_count ?? null;
  const displayName =
    data?.original_name ?? activeFile?.original_name ?? 'Dataset';

  const rows = data?.rows ?? [];

  const columnMeta = useMemo(
    () =>
      columns.map((col) => ({
        id: col,
        dtype: dtypes[col] ?? 'unknown',
        nulls: nullCounts[col] ?? 0,
      })),
    [columns, dtypes, nullCounts]
  );

  if (!fileId) {
    return null;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        mx: 3,
        mt: 1.5,
        mb: 0,
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.25,
          bgcolor: 'action.hover',
          transition: 'background-color 0.2s ease',
          '&:hover': { bgcolor: 'action.selected' },
        }}
      >
        <Box
          role="button"
          tabIndex={0}
          aria-expanded={expanded}
          aria-controls="data-preview-region"
          onClick={() => setExpanded((e) => !e)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setExpanded((v) => !v);
            }
          }}
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            minWidth: 0,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <TableChartOutlinedIcon sx={{ fontSize: 22, color: 'primary.main', flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Data preview
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {displayName}
              {totalRows != null ? ` · ${totalRows.toLocaleString()} rows` : ''}
              {columns.length ? ` · ${columns.length} columns` : ''}
            </Typography>
          </Box>
        </Box>
        <Tooltip title={expanded ? 'Collapse' : 'Expand'}>
          <IconButton
            size="small"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? 'Collapse preview' : 'Expand preview'}
            sx={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {loading && <LinearProgress sx={{ height: 2 }} />}

      <Collapse in={expanded} timeout="auto" unmountOnExit={false}>
        <Box id="data-preview-region" sx={{ px: 2, pb: 2, pt: loading ? 1 : 0 }}>
          {error && (
            <Alert severity="warning" sx={{ mt: 1.5, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {!error && data && (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, mb: 1 }}>
                {data.preview_row_count === 0
                  ? 'No data rows in this file (headers only or empty).'
                  : `Sample of first ${data.preview_row_count.toLocaleString()} row${
                      data.preview_row_count === 1 ? '' : 's'
                    }${
                      data.total_row_count > data.preview_row_count
                        ? ` (of ${data.total_row_count.toLocaleString()} total)`
                        : ''
                    }`}
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.75,
                  mb: 1.5,
                  maxHeight: { xs: 100, sm: 88 },
                  overflowY: 'auto',
                }}
              >
                {columnMeta.map(({ id, dtype, nulls }) => (
                  <Tooltip
                    key={id}
                    title={
                      nulls > 0
                        ? `${id}: ${dtype}, ${nulls} null${nulls === 1 ? '' : 's'}`
                        : `${id}: ${dtype}`
                    }
                  >
                    <Chip
                      size="small"
                      label={
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography component="span" variant="caption" sx={{ fontWeight: 600, maxWidth: 120 }} noWrap>
                            {id}
                          </Typography>
                          <Typography component="span" variant="caption" color="text.secondary">
                            {dtype}
                          </Typography>
                          {nulls > 0 ? (
                            <Typography component="span" variant="caption" color="warning.main">
                              {nulls}∅
                            </Typography>
                          ) : null}
                        </Box>
                      }
                      variant="outlined"
                      sx={{ borderRadius: 1.5, height: 'auto', py: 0.25 }}
                    />
                  </Tooltip>
                ))}
              </Box>

              <TableContainer
                sx={{
                  maxHeight: { xs: 'min(35vh, 260px)', sm: 'min(40vh, 320px)' },
                  borderRadius: 1.5,
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {columns.map((col) => (
                        <TableCell
                          key={col}
                          sx={{
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            bgcolor: 'background.paper',
                            maxWidth: 200,
                          }}
                        >
                          {col}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row, idx) => (
                      <TableRow key={idx} hover>
                        {columns.map((col) => (
                          <TableCell key={col} sx={{ maxWidth: 200, verticalAlign: 'top' }}>
                            <CellValue value={row[col]} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {!loading && !error && !data && (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              No preview data.
            </Typography>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}
