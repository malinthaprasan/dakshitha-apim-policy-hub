import { Component, ReactNode, ErrorInfo } from 'react';
import { Alert, AlertTitle, Box, Button, Typography } from '@mui/material';
import { Refresh } from '@mui/icons-material';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Error Info:', errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // In production, you might want to send this to an error reporting service
    // Example: sendErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            px: 2,
          }}
        >
          <Alert
            severity="error"
            sx={{
              maxWidth: 600,
              width: '100%',
              mb: 2,
            }}
          >
            <AlertTitle>Something went wrong</AlertTitle>
            <Typography variant="body2" sx={{ mb: 2 }}>
              An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
            </Typography>
            
            {import.meta.env.DEV && this.state.error && (
              <Box
                component="details"
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  overflow: 'auto',
                }}
              >
                <Typography component="summary" sx={{ cursor: 'pointer', fontWeight: 600, mb: 1 }}>
                  Error Details (Development)
                </Typography>
                <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: 'inherit' }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<Refresh />}
                onClick={this.handleReload}
              >
                Refresh Page
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={this.handleReset}
              >
                Try Again
              </Button>
            </Box>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}
