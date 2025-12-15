import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  variant?: 'filled' | 'outlined';
  size?: 'small' | 'medium';
}

export function Badge({ 
  children, 
  color = 'primary', 
  variant = 'filled',
  size = 'small' 
}: BadgeProps) {
  const getBackgroundColor = () => {
    if (variant === 'outlined') return 'transparent';
    
    switch (color) {
      case 'primary': return 'primary.main';
      case 'secondary': return 'secondary.main';
      case 'success': return 'success.main';
      case 'warning': return 'warning.main';
      case 'error': return 'error.main';
      case 'info': return 'info.main';
      default: return 'primary.main';
    }
  };

  const getTextColor = () => {
    if (variant === 'outlined') {
      return `${color}.main`;
    }
    return `${color}.contrastText`;
  };

  const getBorderColor = () => {
    return variant === 'outlined' ? `${color}.main` : 'transparent';
  };

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: size === 'small' ? 1.25 : 1.75,
        py: size === 'small' ? 0.375 : 0.625,
        borderRadius: size === 'small' ? 1.5 : 2,
        backgroundColor: getBackgroundColor(),
        border: variant === 'outlined' ? 1.5 : 0,
        borderColor: getBorderColor(),
        boxShadow: variant === 'filled' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: variant === 'filled' ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
        },
      }}
    >
      <Typography
        variant={size === 'small' ? 'caption' : 'body2'}
        sx={{
          color: getTextColor(),
          fontWeight: 600,
          fontSize: size === 'small' ? '0.7rem' : '0.8rem',
          letterSpacing: '0.02em',
        }}
      >
        {children}
      </Typography>
    </Box>
  );
}
