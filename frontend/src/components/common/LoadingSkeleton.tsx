import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Grid,
} from '@mui/material';

interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'detail' | 'text';
  count?: number;
}

export function LoadingSkeleton({ variant = 'card', count = 1 }: LoadingSkeletonProps) {
  const renderCardSkeleton = () => (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="rectangular" width={48} height={48} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </Box>
          </Box>
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="80%" />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton variant="rectangular" width={60} height={24} />
            <Skeleton variant="rectangular" width={80} height={24} />
            <Skeleton variant="rectangular" width={70} height={24} />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  const renderListSkeleton = () => (
    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
      <Stack spacing={1}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton variant="rectangular" width={32} height={32} />
          <Skeleton variant="text" width="30%" />
        </Box>
        <Skeleton variant="text" width="70%" />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton variant="rectangular" width={60} height={20} />
          <Skeleton variant="rectangular" width={80} height={20} />
        </Box>
      </Stack>
    </Box>
  );

  const renderDetailSkeleton = () => (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="text" width="20%" height={24} />
      </Box>
      
      <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
        <Skeleton variant="rectangular" width={80} height={80} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="50%" height={40} />
          <Skeleton variant="text" width="80%" height={24} />
          <Skeleton variant="text" width="60%" height={24} />
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Skeleton variant="rectangular" width={80} height={24} />
            <Skeleton variant="rectangular" width={90} height={24} />
            <Skeleton variant="rectangular" width={70} height={24} />
          </Box>
        </Box>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="rectangular" width="100%" height={48} />
      </Box>
      
      <Box>
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="80%" />
      </Box>
    </Box>
  );

  const renderTextSkeleton = () => (
    <Box>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} variant="text" width="100%" sx={{ mb: 1 }} />
      ))}
    </Box>
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return renderCardSkeleton();
      case 'list':
        return renderListSkeleton();
      case 'detail':
        return renderDetailSkeleton();
      case 'text':
        return renderTextSkeleton();
      default:
        return renderCardSkeleton();
    }
  };

  if (variant === 'card') {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: count }).map((_, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            {renderSkeleton()}
          </Grid>
        ))}
      </Grid>
    );
  }

  if (variant === 'list') {
    return (
      <Box>
        {Array.from({ length: count }).map((_, index) => (
          <Box key={index}>{renderSkeleton()}</Box>
        ))}
      </Box>
    );
  }

  return renderSkeleton();
}
