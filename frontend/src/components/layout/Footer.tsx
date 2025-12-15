import {
  Box,
  Container,
  Typography,
  Link,
  Divider,
  Stack,
  Grid,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        mt: 'auto',
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          <Grid container spacing={4} columns={{ xs: 1, sm: 2, md: 4 }}>
            <Grid size={1}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Policy Hub
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Discover and explore WSO2 API Platform policies for security,
                traffic control, and more.
              </Typography>
            </Grid>
            
            <Grid size={1}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Navigation
              </Typography>
              <Stack spacing={1}>
                <Link
                  component={RouterLink}
                  to={ROUTES.POLICIES}
                  variant="body2"
                  color="text.secondary"
                  sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                >
                  Browse Policies
                </Link>
                <Link
                  component={RouterLink}
                  to={ROUTES.CUSTOM_POLICY_GUIDE}
                  variant="body2"
                  color="text.secondary"
                  sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                >
                  Custom Policy Guide
                </Link>
                <Link
                  component={RouterLink}
                  to={ROUTES.ABOUT}
                  variant="body2"
                  color="text.secondary"
                  sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                >
                  About
                </Link>
              </Stack>
            </Grid>
            
            <Grid size={1}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                WSO2 Resources
              </Typography>
              <Stack spacing={1}>
                <Link
                  href="https://wso2.com/api-manager/"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body2"
                  color="text.secondary"
                  sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                >
                  API Manager
                </Link>
                <Link
                  href="https://docs.wso2.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body2"
                  color="text.secondary"
                  sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                >
                  Documentation
                </Link>
                <Link
                  href="https://github.com/wso2"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body2"
                  color="text.secondary"
                  sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                >
                  GitHub
                </Link>
              </Stack>
            </Grid>
            
            <Grid size={1}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Support
              </Typography>
              <Stack spacing={1}>
                <Link
                  href="https://wso2.com/contact/"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body2"
                  color="text.secondary"
                  sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                >
                  Contact Us
                </Link>
                <Link
                  href="https://wso2.com/subscription/"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body2"
                  color="text.secondary"
                  sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                >
                  Enterprise Support
                </Link>
                <Link
                  href="https://stackoverflow.com/questions/tagged/wso2"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body2"
                  color="text.secondary"
                  sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                >
                  Community
                </Link>
              </Stack>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              © {currentYear} WSO2 LLC. All rights reserved.
            </Typography>
            
            <Stack direction="row" spacing={3}>
              <Link
                href="https://wso2.com/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                Privacy Policy
              </Link>
              <Link
                href="https://wso2.com/terms-of-use"
                target="_blank"
                rel="noopener noreferrer"
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                Terms of Use
              </Link>
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
