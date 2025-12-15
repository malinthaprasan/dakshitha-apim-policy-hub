import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Menu as MenuIcon } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { ROUTES } from '@/lib/constants';

const navigationItems = [
  { label: 'Policies', path: ROUTES.POLICIES },
  { label: 'Custom Policy Guide', path: ROUTES.CUSTOM_POLICY_GUIDE },
  { label: 'About', path: ROUTES.ABOUT },
];

export function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const isActivePath = (path: string) => {
    if (path === ROUTES.POLICIES) {
      return location.pathname === path || location.pathname.startsWith('/policies');
    }
    return location.pathname === path;
  };

  const renderDesktopNav = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {navigationItems.map((item) => (
        <Button
          key={item.path}
          component={Link}
          to={item.path}
          sx={{
            color: isActivePath(item.path) ? 'white' : 'rgba(255,255,255,0.9)',
            fontWeight: isActivePath(item.path) ? 700 : 500,
            textTransform: 'none',
            px: 3,
            py: 1.5,
            borderRadius: 2,
            background: isActivePath(item.path) ? 'rgba(255,255,255,0.2)' : 'transparent',
            backdropFilter: isActivePath(item.path) ? 'blur(10px)' : 'none',
            border: isActivePath(item.path) ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
            '&:hover': {
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
            },
          }}
        >
          {item.label}
        </Button>
      ))}
      <Box sx={{ ml: 1 }}>
        <ThemeToggle />
      </Box>
    </Box>
  );

  const renderMobileNav = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <ThemeToggle />
      <IconButton
        size="large"
        edge="end"
        color="inherit"
        aria-label="menu"
        onClick={handleMobileMenuOpen}
      >
        <MenuIcon />
      </IconButton>
      <Menu
        anchorEl={mobileMenuAnchor}
        open={Boolean(mobileMenuAnchor)}
        onClose={handleMobileMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {navigationItems.map((item) => (
          <MenuItem
            key={item.path}
            component={Link}
            to={item.path}
            onClick={handleMobileMenuClose}
            selected={isActivePath(item.path)}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
        boxShadow: `0 4px 20px ${theme.palette.primary.main}25`,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <Box
            component={Link}
            to={ROUTES.HOME}
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                mr: 2,
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 800,
                fontSize: '1.2rem',
                boxShadow: '0 8px 32px rgba(255,255,255,0.1)',
              }}
            >
              W
            </Box>
            <Typography
              variant="h6"
              component="h1"
              sx={{
                fontWeight: 700,
                color: 'white',
                fontSize: '1.25rem',
              }}
            >
              Policy Hub
            </Typography>
          </Box>

          {isMobile ? renderMobileNav() : renderDesktopNav()}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
