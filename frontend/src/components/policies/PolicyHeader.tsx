import {
  Box,
  Typography,
  Avatar,
  Stack,
  Paper,
  Grid,
} from '@mui/material';
import { Policy } from '@/lib/types';
import { Tag } from '@/components/common/Tag';
import { Badge } from '@/components/common/Badge';
import { formatDate } from '@/lib/utils';

interface PolicyHeaderProps {
  summary: Policy;
  versionDetail?: Policy;
}

export function PolicyHeader({ summary, versionDetail }: PolicyHeaderProps) {
  const displayVersion = versionDetail || {
    name: summary.name,
    version: summary.version || '',
    displayName: summary.displayName,
    description: summary.description,
    provider: summary.provider,
    categories: summary.categories,
    tags: summary.tags,
    supportedPlatforms: summary.supportedPlatforms,
    logoUrl: summary.logoUrl,
    bannerUrl: summary.bannerUrl,
    iconUrl: summary.iconUrl,
    releaseDate: summary.releaseDate,
    isLatest: summary.isLatest,
    sourceType: summary.sourceType,
    sourceUrl: summary.sourceUrl,
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        mb: 4,
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Avatar
              src={displayVersion.iconUrl || summary.logoUrl}
              alt={`${summary.displayName} logo`}
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                fontSize: '2rem',
                fontWeight: 600,
              }}
            >
              {summary.displayName.charAt(0).toUpperCase()}
            </Avatar>
            
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  lineHeight: 1.2,
                }}
              >
                {summary.displayName}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Badge color="primary" size="medium">
                  {summary.provider}
                </Badge>
                
                {displayVersion.version && (
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 500,
                    }}
                  >
                    Version {displayVersion.version}
                  </Typography>
                )}
                
                {versionDetail?.releaseDate && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                    }}
                  >
                    Released {formatDate(versionDetail.releaseDate)}
                  </Typography>
                )}
              </Box>
              
              {(displayVersion.description || summary.description) && (
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.6,
                    mb: 3,
                  }}
                >
                  {displayVersion.description || summary.description}
                </Typography>
              )}
              
              {/* Categories */}
              {summary.categories && summary.categories.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
                    Categories
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {summary.categories.map((category) => (
                      <Tag
                        key={category}
                        label={category}
                        color="primary"
                      />
                    ))}
                  </Stack>
                </Box>
              )}
              
              {/* Tags */}
              {summary.tags && summary.tags.length > 0 && (
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
                    Tags
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {summary.tags.map((tag) => (
                      <Tag
                        key={tag}
                        label={tag}
                        variant="outlined"
                        color="default"
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>
          </Box>
        </Grid>
        
        <Grid size={{ xs: 12, md: 4 }}>
          <Box>
            {/* Supported Platforms */}
            {(displayVersion.supportedPlatforms || summary.supportedPlatforms) && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, fontWeight: 600 }}
                >
                  Supported Platforms
                </Typography>
                <Stack spacing={1}>
                  {(displayVersion.supportedPlatforms || summary.supportedPlatforms || []).map((platform) => (
                    <Badge
                      key={platform}
                      color="secondary"
                      variant="outlined"
                    >
                      {platform}
                    </Badge>
                  ))}
                </Stack>
              </Box>
            )}
            
            {/* Banner Image */}
            {summary.bannerUrl && (
              <Box
                component="img"
                src={summary.bannerUrl}
                alt={`${summary.displayName} banner`}
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 1,
                  mb: 2,
                }}
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
