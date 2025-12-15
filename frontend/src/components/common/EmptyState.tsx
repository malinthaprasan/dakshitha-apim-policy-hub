import { Box, Typography, Button, Paper } from '@mui/material';
import { Search, FilterList, Refresh } from '@mui/icons-material';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'contained' | 'outlined' | 'text';
  };
  variant?: 'default' | 'search' | 'filter' | 'error';
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  variant = 'default',
}: EmptyStateProps) {
  // Default content based on variant
  const getDefaultContent = () => {
    switch (variant) {
      case 'search':
        return {
          title: title || 'No results found',
          description: description || 'Try adjusting your search terms or filters to find what you\'re looking for.',
          icon: icon || <Search sx={{ fontSize: 64, color: 'text.secondary' }} />,
        };
      case 'filter':
        return {
          title: title || 'No items match your filters',
          description: description || 'Try removing some filters or adjusting your criteria.',
          icon: icon || <FilterList sx={{ fontSize: 64, color: 'text.secondary' }} />,
        };
      case 'error':
        return {
          title: title || 'Unable to load content',
          description: description || 'Please try again or contact support if the problem persists.',
          icon: icon || <Refresh sx={{ fontSize: 64, color: 'text.secondary' }} />,
        };
      default:
        return {
          title: title || 'Nothing here yet',
          description: description || 'There are no items to display at the moment.',
          icon: icon || <Search sx={{ fontSize: 64, color: 'text.secondary' }} />,
        };
    }
  };

  const content = getDefaultContent();

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: { xs: 6, md: 8 },
        px: 3,
        minHeight: 300,
        bgcolor: 'transparent',
        border: '2px dashed',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      {/* Icon */}
      <Box sx={{ mb: 3 }}>
        {content.icon}
      </Box>

      {/* Title */}
      <Typography
        variant="h6"
        color="text.secondary"
        gutterBottom
        sx={{ fontWeight: 600 }}
      >
        {content.title}
      </Typography>

      {/* Description */}
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: action ? 3 : 0, maxWidth: 500, lineHeight: 1.6 }}
      >
        {content.description}
      </Typography>

      {/* Action button */}
      {action && (
        <Button
          variant={action.variant || 'outlined'}
          onClick={action.onClick}
          size="large"
          sx={{
            minWidth: 120,
          }}
        >
          {action.label}
        </Button>
      )}
    </Paper>
  );
}
