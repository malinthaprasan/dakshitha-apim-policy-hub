import { Alert, AlertTitle, Box, Button, Typography } from '@mui/material';
import { Refresh, Error as ErrorIcon, Warning } from '@mui/icons-material';
import { ApiError } from '@/lib/types';

interface ErrorDisplayProps {
  error: ApiError | Error | string | null;
  title?: string;
  variant?: 'standard' | 'compact' | 'inline';
  severity?: 'error' | 'warning' | 'info';
  showRetry?: boolean;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({
  error,
  title,
  variant = 'standard',
  severity = 'error',
  showRetry = false,
  onRetry,
  className,
}: ErrorDisplayProps) {
  if (!error) return null;

  const getErrorMessage = () => {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (error && typeof error === 'object' && 'message' in error) {
      return (error as { message: string }).message;
    }
    return 'An unexpected error occurred';
  };

  const getErrorCode = () => {
    if (typeof error === 'object' && error && 'code' in error) {
      return error.code;
    }
    return null;
  };

  const errorMessage = getErrorMessage();
  const errorCode = getErrorCode();
  const displayTitle = title || (severity === 'error' ? 'Error' : 'Warning');

  // Compact variant for inline errors
  if (variant === 'compact') {
    return (
      <Alert
        severity={severity}
        className={className}
        sx={{ mb: 1 }}
        action={
          showRetry && onRetry ? (
            <Button size="small" color="inherit" onClick={onRetry}>
              Retry
            </Button>
          ) : undefined
        }
      >
        <Typography variant="body2">
          {errorMessage}
          {errorCode && (
            <Typography component="span" sx={{ ml: 1, opacity: 0.7, fontSize: '0.75rem' }}>
              ({errorCode})
            </Typography>
          )}
        </Typography>
      </Alert>
    );
  }

  // Inline variant for very minimal errors
  if (variant === 'inline') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          color: severity === 'error' ? 'error.main' : 'warning.main',
          fontSize: '0.875rem',
          gap: 0.5,
        }}
        className={className}
      >
        {severity === 'error' ? (
          <ErrorIcon fontSize="small" />
        ) : (
          <Warning fontSize="small" />
        )}
        <Typography variant="body2" color="inherit">
          {errorMessage}
        </Typography>
      </Box>
    );
  }

  // Standard variant with full details
  return (
    <Alert
      severity={severity}
      className={className}
      sx={{ mb: 2 }}
    >
      <AlertTitle>{displayTitle}</AlertTitle>
      <Typography variant="body2" sx={{ mb: showRetry ? 2 : 0 }}>
        {errorMessage}
        {errorCode && (
          <Typography component="span" sx={{ ml: 1, opacity: 0.7, fontSize: '0.75rem' }}>
            (Error Code: {errorCode})
          </Typography>
        )}
      </Typography>
      
      {showRetry && onRetry && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<Refresh />}
          onClick={onRetry}
          sx={{ mt: 1 }}
        >
          Try Again
        </Button>
      )}
    </Alert>
  );
}
