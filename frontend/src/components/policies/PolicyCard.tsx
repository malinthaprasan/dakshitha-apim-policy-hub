import { useCallback } from 'react';
import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  Stack,
  Avatar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Policy, ViewMode } from '@/lib/types';
import { routes } from '@/lib/utils';
import { useResponsive } from '@/hooks/ui/useResponsive';


interface PolicyCardProps {
  policy: Policy;
  viewMode?: ViewMode;
}

export function PolicyCard({ policy, viewMode = 'grid' }: PolicyCardProps) {
  const navigate = useNavigate();
  const { theme } = useResponsive();

  const handleClick = useCallback(() => {
    navigate(routes.policyDetail(policy.name));
  }, [navigate, policy.name]);

  const isGridView = viewMode === 'grid';

  return (
    <Card
      elevation={0}
      sx={{
        height: isGridView ? '100%' : 'auto',
        display: 'flex',
        flexDirection: isGridView ? 'column' : { xs: 'column', sm: 'row' },
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        cursor: 'pointer',
        bgcolor: 'background.paper',
        borderRadius: { xs: 3, sm: 4 },
        overflow: 'hidden',
        position: 'relative',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: theme.shadows[1],
        backdropFilter: 'blur(20px)',
        '&:hover': {
          borderColor: theme.palette.primary.main,
        },
      }}
    >
      <CardActionArea
        onClick={handleClick}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: isGridView ? 'column' : 'row',
          alignItems: 'stretch',
          p: 0,
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2, sm: 2.5, md: 3 },
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: isGridView ? '260px' : 'auto',
            '&:last-child': {
              pb: { xs: 2, sm: 2.5, md: 3 }
            }
          }}
        >
          {/* Header Section */}
          <Box sx={{ mb: 2 }}>
            {/* First row: Avatar + Title */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 1.5, sm: 2 }, 
              mb: { xs: 1.5, sm: 2 } 
            }}>
              <Avatar
                src={policy.logoUrl}
                alt={`${policy.displayName} logo`}
                className="policy-avatar"
                sx={{
                  width: { 
                    xs: 40, 
                    sm: isGridView ? 48 : 40, 
                    md: isGridView ? 56 : 48 
                  },
                  height: { 
                    xs: 40, 
                    sm: isGridView ? 48 : 40, 
                    md: isGridView ? 56 : 48 
                  },
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  fontSize: { 
                    xs: '1rem', 
                    sm: isGridView ? '1.2rem' : '1rem', 
                    md: isGridView ? '1.4rem' : '1.2rem' 
                  },
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(25,118,210,0.15)',
                }}
              >
                {policy.displayName.charAt(0).toUpperCase()}
              </Avatar>
              
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant={isGridView ? 'h6' : 'subtitle1'}
                  component="h3"
                  title={policy.displayName}
                  className="policy-title"
                  sx={{
                    fontWeight: 600,
                    lineHeight: 1.3,
                    color: 'text.primary',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    cursor: 'help',
                  }}
                >
                  {policy.displayName}
                </Typography>
              </Box>
            </Box>

            {/* Second row: Provider */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: { xs: 'flex-start', sm: 'flex-end' }, 
              gap: { xs: 1, sm: 1.5 }, 
              flexWrap: 'wrap',
              mt: { xs: 1, sm: 0 }
            }}>
              <Box
                className="provider-chip"
                sx={{
                  bgcolor: 'transparent',
                  color: 'text.primary',
                  border: '1px solid',
                  borderColor: 'divider',
                  px: { xs: 1.25, sm: 1.5 },
                  py: { xs: 0.25, sm: 0.375 },
                  borderRadius: 1.5,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  letterSpacing: '0.25px',
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                {policy.provider}
              </Box>
              
              {policy.isLatest && (
                <Box
                  sx={{
                    bgcolor: 'transparent',
                    color: 'text.secondary',
                    border: '1px solid',
                    borderColor: 'divider',
                    px: 1.25,
                    py: 0.25,
                    borderRadius: 0.5,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                  }}
                >
                  v{policy.version}
                </Box>
              )}
            </Box>
          </Box>

          {/* Description Section */}
          {policy.description && (
            <Box sx={{ mb: { xs: 2, sm: 2.5 }, flex: 1 }}>
              <Typography
                variant="body2"
                title={policy.description}
                sx={{
                  color: 'text.secondary',
                  lineHeight: { xs: 1.4, sm: 1.5 },
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  display: '-webkit-box',
                  WebkitLineClamp: { xs: 2, sm: 3 },
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  cursor: 'help',
                  fontWeight: 400,
                }}
              >
                {policy.description}
              </Typography>
            </Box>
          )}

          {/* Tags Section */}
          <Box sx={{ mt: 'auto' }}>
            {/* Tags */}
            {policy.tags && policy.tags.length > 0 && (
              <Box>
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{ flexWrap: 'wrap', gap: 0.75 }}
                >
                  {policy.tags.slice(0, isGridView ? 4 : 3).map((tag) => (
                    <Box
                      key={tag}
                      sx={(theme) => ({
                        bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
                        color: theme.palette.mode === 'dark' ? 'grey.200' : 'grey.800',
                        px: 1.25,
                        py: 0.375,
                        borderRadius: 1.25,
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        textTransform: 'capitalize',
                        border: '1px solid',
                        borderColor: theme.palette.mode === 'dark' ? 'grey.600' : 'grey.300',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          bgcolor: theme.palette.mode === 'dark' ? 'grey.700' : 'grey.200',
                          borderColor: theme.palette.mode === 'dark' ? 'grey.500' : 'grey.400',
                          transform: 'translateY(-1px)',
                        },
                      })}
                    >
                      {tag}
                    </Box>
                  ))}
                  {policy.tags.length > (isGridView ? 4 : 3) && (
                    <Box
                      sx={(theme) => ({
                        bgcolor: theme.palette.mode === 'dark' ? 'grey.700' : 'grey.200',
                        color: theme.palette.mode === 'dark' ? 'grey.400' : 'grey.600',
                        px: 1.25,
                        py: 0.375,
                        borderRadius: 1.25,
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        border: '1px dashed',
                        borderColor: theme.palette.mode === 'dark' ? 'grey.600' : 'grey.400',
                      })}
                    >
                      +{policy.tags.length - (isGridView ? 4 : 3)}
                    </Box>
                  )}
                </Stack>
              </Box>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
