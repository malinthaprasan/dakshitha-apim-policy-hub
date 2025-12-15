import { Alert, Snackbar, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

interface ErrorNotification {
  id: string;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'success';
  duration?: number;
}

interface ErrorNotificationContextValue {
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
}

const ErrorNotificationContext = createContext<ErrorNotificationContextValue | undefined>(undefined);

export function useErrorNotification() {
  const context = useContext(ErrorNotificationContext);
  if (context === undefined) {
    throw new Error('useErrorNotification must be used within ErrorNotificationProvider');
  }
  return context;
}

interface ErrorNotificationProviderProps {
  children: ReactNode;
  maxNotifications?: number;
}

export function ErrorNotificationProvider({ 
  children, 
  maxNotifications = 3 
}: ErrorNotificationProviderProps) {
  const [notifications, setNotifications] = useState<ErrorNotification[]>([]);

  const addNotification = useCallback((
    message: string,
    severity: ErrorNotification['severity'],
    duration = 6000
  ) => {
    const id = Date.now().toString();
    const notification: ErrorNotification = {
      id,
      message,
      severity,
      duration,
    };

    setNotifications(prev => {
      const newNotifications = [notification, ...prev];
      // Keep only the most recent notifications
      return newNotifications.slice(0, maxNotifications);
    });

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        clearNotification(id);
      }, duration);
    }
  }, [maxNotifications]);

  const showError = useCallback((message: string, duration?: number) => {
    addNotification(message, 'error', duration);
  }, [addNotification]);

  const showWarning = useCallback((message: string, duration?: number) => {
    addNotification(message, 'warning', duration);
  }, [addNotification]);

  const showInfo = useCallback((message: string, duration?: number) => {
    addNotification(message, 'info', duration);
  }, [addNotification]);

  const showSuccess = useCallback((message: string, duration?: number) => {
    addNotification(message, 'success', duration);
  }, [addNotification]);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = useMemo<ErrorNotificationContextValue>(() => ({
    showError,
    showWarning,
    showInfo,
    showSuccess,
    clearNotification,
    clearAll,
  }), [showError, showWarning, showInfo, showSuccess, clearNotification, clearAll]);

  return (
    <ErrorNotificationContext.Provider value={value}>
      {children}
      
      {/* Render notifications */}
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open
          anchorOrigin={{ 
            vertical: 'top', 
            horizontal: 'right' 
          }}
          sx={{
            mt: index * 7, // Stack notifications
            zIndex: 9999 - index, // Ensure proper stacking
          }}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={() => clearNotification(notification.id)}
            >
              <Close fontSize="small" />
            </IconButton>
          }
        >
          <Alert
            severity={notification.severity}
            variant="filled"
            sx={{ width: '100%' }}
            action={
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={() => clearNotification(notification.id)}
              >
                <Close fontSize="small" />
              </IconButton>
            }
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </ErrorNotificationContext.Provider>
  );
}
