import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Paper,
  Grid,
} from '@mui/material';
import {
  Security,
  Speed,
  Description,
  Build,
  ArrowForward,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useResponsive } from '@/hooks/ui/useResponsive';
import { useAsyncData } from '@/hooks/data/useAsyncData';
import { apiClient } from '@/lib/apiClient';
import { ROUTES } from '@/lib/constants';
import { PolicyCard } from '@/components/policies/PolicyCard';

const features = [
  {
    icon: <Security />,
    title: 'Discover Policies',
    description: 'Explore a comprehensive collection of ready-made API management policies for security, traffic control, and more.',
  },
  {
    icon: <Description />,
    title: 'Detailed Documentation',
    description: 'Access complete documentation with configuration examples, use cases, and implementation guides.',
  },
  {
    icon: <Speed />,
    title: 'Version Management',
    description: 'Browse different versions of policies with clear release notes and compatibility information.',
  },
  {
    icon: <Build />,
    title: 'Custom Policies',
    description: 'Learn how to create and publish your own custom policies with our comprehensive guide.',
  },
];

export function HomePage() {
  const { theme } = useResponsive();

  // Data fetching
  const {
    data: featuredPolicies,
    loading: isLoadingFeatured,
  } = useAsyncData(
    () => apiClient.listPolicies({ pageSize: 3 }),
    [],
    { immediate: true, cacheKey: 'featured-policies' }
  );

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 50%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid 
              size={{ xs: 12, md: 6 }}
              display="flex"
              flexDirection="column"
              justifyContent="center"
            >
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                }}
              >
                WSO2 Policy Hub
              </Typography>
              
              <Typography
                variant="h6"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  lineHeight: 1.6,
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                }}
              >
                Discover, explore, and implement powerful API management policies
                for your WSO2 API Platform. Enhance security, control traffic, 
                and optimize your APIs with our curated policy collection.
              </Typography>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  component={RouterLink}
                  to={ROUTES.POLICIES}
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  Explore Policies
                </Button>
                
                <Button
                  component={RouterLink}
                  to={ROUTES.CUSTOM_POLICY_GUIDE}
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Create Custom Policy
                </Button>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }} offset={{ md: 0 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: { xs: 200, md: 300 },
                }}
              >
                {/* Placeholder for hero illustration */}
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{ opacity: 0.6, textAlign: 'center' }}
                  >
                    Policy Hub
                    <br />
                    Illustration
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          sx={{
            textAlign: 'center',
            mb: 2,
            fontWeight: 600,
          }}
        >
          Everything You Need
        </Typography>
        
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            textAlign: 'center',
            mb: 6,
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          Comprehensive policy management tools and resources to enhance your API platform
        </Typography>

        <Grid container spacing={4} columns={{ xs: 1, sm: 2, md: 4 }}>
          {features.map((feature, index) => (
            <Grid size={1} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                      '& svg': {
                        fontSize: '2rem',
                      },
                    }}
                  >
                    {feature.icon}
                  </Box>
                  
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{ mb: 2, fontWeight: 600 }}
                  >
                    {feature.title}
                  </Typography>
                  
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.6 }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Policies Section */}
      {(isLoadingFeatured || (featuredPolicies?.success && featuredPolicies.data && featuredPolicies.data.length > 0)) && (
        <Box sx={{ bgcolor: 'background.default', py: 8 }}>
          <Container maxWidth="lg">
            <Typography
              variant="h3"
              component="h2"
              sx={{
                textAlign: 'center',
                mb: 2,
                fontWeight: 600,
              }}
            >
              Featured Policies
            </Typography>
            
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                textAlign: 'center',
                mb: 6,
              }}
            >
              Popular and recently updated policies
            </Typography>

            <Grid container spacing={3} columns={{ xs: 1, md: 3 }}>
              {isLoadingFeatured ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Grid size={1} key={i}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>Loading...</CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                featuredPolicies?.data?.slice(0, 3)?.map((policy) => (
                <Grid size={1} key={policy.name}>
                  <PolicyCard policy={policy} viewMode="grid" />
                </Grid>
              )) || [])}
            </Grid>
            
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                component={RouterLink}
                to={ROUTES.POLICIES}
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
              >
                View All Policies
              </Button>
            </Box>
          </Container>
        </Box>
      )}

      {/* Call to Action Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            bgcolor: 'background.paper',
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            sx={{ mb: 3, fontWeight: 600 }}
          >
            Ready to Get Started?
          </Typography>
          
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
          >
            Explore our policy catalog or learn how to create your own custom policies
          </Typography>
          
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'center' }}
          >
            <Button
              component={RouterLink}
              to={ROUTES.POLICIES}
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
            >
              Browse Policies
            </Button>
            
            <Button
              component={RouterLink}
              to={ROUTES.CUSTOM_POLICY_GUIDE}
              variant="outlined"
              size="large"
            >
              Custom Policy Guide
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
