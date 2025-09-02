import React from 'react';
import { Box, Typography, Button } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // You can also log the error to an error reporting service here
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box 
          sx={{ 
            p: 3, 
            textAlign: 'center',
            border: '1px solid #ff6b6b',
            borderRadius: 1,
            backgroundColor: '#ffe0e0'
          }}
        >
          <Typography variant="h6" color="error" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Typography>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={this.handleReset}
          >
            Try Again
          </Button>
          {import.meta.env?.DEV && this.state.errorInfo && (
            <Box sx={{ mt: 2, textAlign: 'left', fontSize: '0.8rem' }}>
              <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                {this.state.error?.stack}
              </Typography>
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;