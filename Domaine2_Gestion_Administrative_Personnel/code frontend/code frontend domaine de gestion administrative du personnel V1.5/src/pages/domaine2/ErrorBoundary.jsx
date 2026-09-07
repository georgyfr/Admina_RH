import React from 'react';
import { Box, Typography, Alert } from '@mui/material';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity='error'>
            <Typography variant='subtitle2'>Erreur de rendu: {this.state.error?.message}</Typography>
            <pre style={{ fontSize: '0.7rem', marginTop: 8 }}>{this.state.error?.stack}</pre>
          </Alert>
        </Box>
      );
    }
    return this.props.children;
  }
}
