import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
const theme = createTheme({ palette: { primary: { main: '#1976D2' } }, typography: { fontFamily: 'Inter, sans-serif' } });
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><ThemeProvider theme={theme}><CssBaseline /><App /></ThemeProvider></React.StrictMode>);
