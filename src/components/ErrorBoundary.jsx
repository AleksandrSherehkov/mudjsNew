import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          p={3}
          textAlign="center"
        >
          <Typography variant="h4" component="h1" gutterBottom color="error">
            Щось пішло не так
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Виникла несподівана помилка. Будь ласка, перезавантажте сторінку або зверніться до підтримки.
          </Typography>
          <Button variant="contained" onClick={this.handleReload} sx={{ mt: 2 }}>
            Перезавантажити сторінку
          </Button>
          {typeof window !== 'undefined' && import.meta.env?.DEV && this.state.error && (
            <Box mt={3} p={2} bgcolor="grey.100" borderRadius={1} maxWidth="100%" overflow="auto">
              <Typography variant="h6" component="h2" gutterBottom>
                Інформація про помилку (лише для розробки):
              </Typography>
              <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                {this.state.error.toString()}
                {this.state.errorInfo.componentStack}
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