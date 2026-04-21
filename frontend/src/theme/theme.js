import { createTheme } from '@mui/material/styles';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: { main: '#0071e3', light: '#2997ff', dark: '#0056b3' },
          secondary: { main: '#86868b', light: '#a1a1a6', dark: '#6e6e73' },
          background: { default: '#f5f5f7', paper: '#ffffff' },
          text: { primary: '#1d1d1f', secondary: '#6e6e73' },
          divider: 'rgba(0, 0, 0, 0.08)',
          success: { main: '#34c759' },
          error: { main: '#ff3b30' },
          warning: { main: '#ff9500' },
        }
      : {
          primary: { main: '#2997ff', light: '#64b5f6', dark: '#0071e3' },
          secondary: { main: '#86868b', light: '#a1a1a6', dark: '#6e6e73' },
          background: { default: '#000000', paper: '#1c1c1e' },
          text: { primary: '#f5f5f7', secondary: '#a1a1a6' },
          divider: 'rgba(255, 255, 255, 0.08)',
          success: { main: '#30d158' },
          error: { main: '#ff453a' },
          warning: { main: '#ff9f0a' },
        }),
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"SF Pro Display"',
      '"SF Pro Text"',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: { fontWeight: 600, letterSpacing: '-0.02em' },
    h5: { fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          padding: '8px 20px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: mode === 'light'
            ? '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)'
            : '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
        },
      },
    },
  },
});

export const createAppTheme = (mode) => createTheme(getDesignTokens(mode));
