import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0D7C66', light: '#0ea685', dark: '#095e4d' },
    secondary: { main: '#1a1a2e' },
    background: { default: '#f5f6fa', paper: '#ffffff' },
    text: { primary: '#1a1a2e', secondary: '#666' },
  },
  typography: { fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none', borderRadius: 8 } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiTableCell: { styleOverrides: { root: { fontSize: '0.82rem' } } },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#0ea685', light: '#33b89a', dark: '#095e4d' },
    secondary: { main: '#e0e0e0' },
    background: { default: '#0a0a1a', paper: '#141428' },
    text: { primary: '#e8e8e8', secondary: '#aaa' },
  },
  typography: { fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none', borderRadius: 8 } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 12, backgroundImage: 'none' } } },
    MuiTableCell: { styleOverrides: { root: { fontSize: '0.82rem', borderColor: '#2a2a4a' } } },
  },
});
