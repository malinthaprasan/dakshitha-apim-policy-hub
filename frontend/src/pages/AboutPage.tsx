import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Security,
  Speed,
  Code,
  Cloud,
  CheckCircle,
  Category,
  Explore,
  Description,
} from '@mui/icons-material';
import { ROUTES } from '@/lib/constants';
import { Breadcrumb } from '@/components/nav/Breadcrumb';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { useStatsData } from '@/hooks/data/useStatsData';

export function AboutPage() {
  const { stats, loading, error } = useStatsData();

  // Generate stats array from fetched data
  const statsDisplay = [
    { 
      label: 'Available Policies', 
      value: loading ? '...' : (stats?.totalPolicies.toString() ?? '0')
    },
    { 
      label: 'Categories', 
      value: loading ? '...' : (stats?.totalCategories.toString() ?? '0')
    },
    { 
      label: 'Supported Platforms', 
      value: loading ? '...' : (stats?.totalPlatforms.toString() ?? '0')
    },
    { 
      label: 'Community Contributors', 
      value: loading ? '...' : (stats ? Math.max(0, stats.totalProviders - 1).toString() : '0')
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4, minHeight: 'calc(100vh - 200px)' }}>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Home', path: ROUTES.HOME },
          { label: 'About', current: true },
        ]}
      />

      {/* Header */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{ fontWeight: 600, mb: 3 }}
        >
          About WSO2 Policy Hub
        </Typography>
        
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}
        >
          The central repository for API management policies, featuring {loading ? '...' : stats?.totalPolicies || 0}+ policies across {loading ? '...' : stats?.totalCategories || 0} categories and {loading ? '...' : stats?.totalPlatforms || 0} supported platforms.
        </Typography>
      </Box>

      {/* Overview */}
      <Paper sx={{ p: 4, mb: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          What is Policy Hub?
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
          WSO2 Policy Hub is a centralized platform that enables API developers and administrators 
          to discover, explore, and implement API management policies for the WSO2 API Platform. 
          It serves as a comprehensive catalog of {loading ? '...' : stats?.totalPolicies || 0}+ policies spanning {loading ? '...' : stats?.totalCategories || 0} categories, including both WSO2-provided and community-contributed 
          solutions that address various aspects of API management.
        </Typography>
        
        <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
          The platform provides detailed documentation, configuration examples, and version 
          management for each policy across {loading ? '...' : stats?.totalPlatforms || 0} supported platforms, making it easy to understand and implement the right 
          policies for your specific use cases. Whether you need security enforcement, 
          traffic control, data transformation, or custom business logic, Policy Hub 
          helps you find and deploy the right solutions.
        </Typography>
      </Paper>

      {/* Statistics */}
      <Paper sx={{ p: 4, mb: 6 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }}
        >
          By the Numbers
        </Typography>
        
        {error && (
          <ErrorDisplay
            error={error}
            title="Failed to load statistics"
            variant="standard"
            severity="error"
          />
        )}
        
        <Grid container spacing={4} columns={{ xs: 2, md: 4 }}>
          {statsDisplay.map((stat, index) => (
            <Grid 
              size={1} 
              key={index} 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center"
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  mb: 1,
                }}
              >
                {stat.value}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {stat.label}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Key Features */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }}
        >
          Key Features
        </Typography>
        
        <Grid container spacing={3} columns={{ xs: 1, sm: 2, md: 4 }}>
          <Grid size={1}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  <Security sx={{ fontSize: 48 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Security First
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Authentication, authorization, encryption, and threat protection policies
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={1}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  <Speed sx={{ fontSize: 48 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Traffic Control
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rate limiting, throttling, caching, and load balancing capabilities
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={1}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  <Cloud sx={{ fontSize: 48 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Cloud Native
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Designed for Kubernetes, containers, and modern cloud architectures
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={1}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  <Code sx={{ fontSize: 48 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Extensible
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {loading ? 'Custom policy development framework' : `${stats ? Math.max(0, stats.totalProviders - 1) : 0} contributors building custom policies`}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Policy Categories */}
      <Paper sx={{ p: 4, mb: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Policy Categories
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Explore {loading ? '...' : stats?.totalCategories || 0} diverse categories of policies designed to address different aspects of API management:
        </Typography>

        <Grid container spacing={2} columns={{ xs: 1, sm: 2, md: 3 }}>
          <Grid size={1}>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Authentication & Authorization" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Security & Threat Protection" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Rate Limiting & Throttling" />
              </ListItem>
            </List>
          </Grid>

          <Grid size={1}>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Data Transformation" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Caching & Performance" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Request/Response Validation" />
              </ListItem>
            </List>
          </Grid>

          <Grid size={1}>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Logging & Monitoring" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Traffic Management" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Custom Business Logic" />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>

      {/* How It Works */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }}
        >
          How It Works
        </Typography>
        
        <Grid container spacing={3} columns={{ xs: 1, md: 3 }}>
          <Grid size={1}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}
                >
                  <Explore />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  1. Discover
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Browse through {loading ? 'our extensive' : `${stats?.totalPolicies || 0}+`} policies across multiple categories. Use advanced filters to find exactly what you need for your API management requirements.
              </Typography>
            </Paper>
          </Grid>

          <Grid size={1}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}
                >
                  <Description />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  2. Learn
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Access comprehensive documentation, configuration examples, and best practices for each policy. Understand how to implement and customize policies for your use case.
              </Typography>
            </Paper>
          </Grid>

          <Grid size={1}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}
                >
                  <Code />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  3. Implement
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Deploy policies to your WSO2 API Platform with confidence. Leverage version management and platform-specific configurations for seamless integration.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Why Policy Hub */}
      <Paper sx={{ p: 4, mb: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Why Use Policy Hub?
        </Typography>
        
        <Grid container spacing={3} columns={{ xs: 1, md: 2 }}>
          <Grid size={1}>
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
              <strong>Centralized Repository:</strong> All your API management policies in one place, making it easy to discover and compare different solutions.
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
              <strong>Version Management:</strong> Track different versions of policies, understand what changed, and choose the right version for your platform.
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
              <strong>Multi-Platform Support:</strong> Policies compatible with {loading ? 'multiple' : stats?.totalPlatforms || 0} different platforms, ensuring flexibility in your deployment architecture.
            </Typography>
          </Grid>

          <Grid size={1}>
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
              <strong>Community Driven:</strong> Benefit from contributions by {loading ? 'our growing' : stats ? Math.max(0, stats.totalProviders - 1) : 0} community contributors who share their expertise and custom solutions.
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
              <strong>Comprehensive Documentation:</strong> Each policy comes with detailed docs, configuration examples, FAQs, and implementation guides.
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
              <strong>Ready to Deploy:</strong> Pre-built, tested policies that you can deploy immediately without starting from scratch.
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Get Started */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Paper sx={{ p: 5, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Ready to Get Started?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
            Explore {loading ? 'our extensive catalog' : `${stats?.totalPolicies || 0}+ policies`} and find the perfect solutions for your API management needs.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Paper
              component="a"
              href={ROUTES.POLICIES}
              sx={{
                px: 4,
                py: 1.5,
                bgcolor: 'white',
                color: 'primary.main',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              }}
            >
              <Category />
              Browse Policies
            </Paper>
            <Paper
              component="a"
              href={ROUTES.CUSTOM_POLICY_GUIDE}
              sx={{
                px: 4,
                py: 1.5,
                bgcolor: 'rgba(255,255,255,0.1)',
                color: 'white',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                border: '2px solid white',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)',
                },
              }}
            >
              <Code />
              Create Custom Policy
            </Paper>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
