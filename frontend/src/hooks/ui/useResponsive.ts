import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

/**
 * Hook for accessing theme and responsive breakpoints
 */
export function useResponsive() {
  const theme = useMuiTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  
  return {
    theme,
    isMobile,
    isTablet,
    isDesktop,
  };
}
