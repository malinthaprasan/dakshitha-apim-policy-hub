import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  Skeleton,
  Grid,
} from '@mui/material';
import { ViewModule, ViewList } from '@mui/icons-material';
import type { Policy, ViewMode, PaginationMeta } from '@/lib/types';
import { PolicyCard } from './PolicyCard';
import { useLocalStorage } from '@/hooks/state/useLocalStorage';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { PaginationControls } from '@/components/common/PaginationControls';
import { EmptyState } from '@/components/common/EmptyState';


interface PolicyListProps {
  policies: Policy[];
  isLoading: boolean;
  error?: Error | null;
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onClearFilters?: () => void;
}

export function PolicyList({
  policies,
  isLoading,
  error,
  pagination,
  onPageChange,
  onPageSizeChange,
  onClearFilters,
}: PolicyListProps) {
  const { value: viewMode, setValue: setViewMode } = useLocalStorage<ViewMode>('policyListViewMode', 'grid');

  if (error) {
    return (
      <Box sx={{ py: 4 }}>
        <ErrorDisplay
          error={error}
          title="Error loading policies"
          variant="standard"
          severity="error"
        />
      </Box>
    );
  }

  const hasResults = policies.length > 0;
  const showPagination = pagination && (pagination.totalPages > 1 || hasResults);

  return (
    <Box>
      {/* View Mode Toggle and Results Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {isLoading ? 'Loading policies...' : 
           pagination ? `${pagination.totalItems} policies` : 
           `${policies.length} policies`}
        </Typography>

        {/* {!isLoading && hasResults && ( */}
          <Stack direction="row" spacing={1}>
            <Tooltip title="Grid view">
              <IconButton
                onClick={() => setViewMode('grid')}
                color={viewMode === 'grid' ? 'primary' : 'default'}
                size="small"
              >
                <ViewModule />
              </IconButton>
            </Tooltip>
            <Tooltip title="List view">
              <IconButton
                onClick={() => setViewMode('list')}
                color={viewMode === 'list' ? 'primary' : 'default'}
                size="small"
              >
                <ViewList />
              </IconButton>
            </Tooltip>
          </Stack>
        {/* )} */}
      </Box>

      {/* Always show content area to prevent layout shifts */}
      {viewMode === 'grid' ? (
        <Grid 
          container 
          spacing={{ xs: 3, sm: 4, md: 5, lg: 5 }}
          columns={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }}
          sx={{ 
            minHeight: policies.length === 0 ? '400px' : 'auto',
            alignContent: 'flex-start',
            '& .MuiGrid-item': {
              display: 'flex',
              '& > *': {
                width: '100%'
              }
            }
          }}
        >
          {/* Render actual policies */}
          {policies.map((policy) => (
            <Grid size={1} key={policy.name}>
              <PolicyCard policy={policy} viewMode={viewMode} />
            </Grid>
          ))}
          
          {/* Always maintain minimum grid items for consistent layout */}
          {isLoading && Array.from({ 
            length: policies.length === 0 ? 8 : Math.max(8 - policies.length, 0) 
          }).map((_, index) => (
            <Grid size={1} key={`skeleton-${index}`}>
              <Card sx={{ 
                height: '100%',
                opacity: isLoading ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out'
              }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Skeleton 
                        variant="rectangular" 
                        width={48} 
                        height={48}
                        animation="wave"
                      />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="70%" animation="wave" />
                        <Skeleton variant="text" width="50%" animation="wave" />
                      </Box>
                    </Box>
                    <Skeleton variant="text" width="100%" animation="wave" />
                    <Skeleton variant="text" width="85%" animation="wave" />
                    <Skeleton variant="text" width="60%" animation="wave" />
                    <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                      <Skeleton variant="rectangular" width={60} height={24} animation="wave" />
                      <Skeleton variant="rectangular" width={80} height={24} animation="wave" />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Stack spacing={2}>
          {/* Render actual policies */}
          {policies.map((policy) => (
            <PolicyCard key={policy.name} policy={policy} viewMode="list" />
          ))}
          
          {/* Always maintain minimum list items for consistent layout */}
          {isLoading && Array.from({ 
            length: policies.length === 0 ? 6 : Math.max(6 - policies.length, 0) 
          }).map((_, index) => (
            <Card 
              key={`skeleton-${index}`} 
              sx={{ 
                p: 2,
                opacity: isLoading ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out'
              }}
            >
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Skeleton 
                    variant="rectangular" 
                    width={40} 
                    height={40}
                    animation="wave"
                  />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="50%" animation="wave" />
                    <Skeleton variant="text" width="30%" animation="wave" />
                  </Box>
                </Box>
                <Skeleton variant="text" width="90%" animation="wave" />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Skeleton variant="rectangular" width={60} height={20} animation="wave" />
                  <Skeleton variant="rectangular" width={80} height={20} animation="wave" />
                </Box>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      {/* Empty State - only show when not loading and no results */}
      {!isLoading && !hasResults && (
        <EmptyState
          variant="search"
          action={onClearFilters ? {
            label: "Clear Filters",
            onClick: onClearFilters,
            variant: "outlined"
          } : undefined}
        />
      )}

      {/* Pagination */}
      {showPagination && (
        <PaginationControls
          pagination={pagination}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </Box>
  );
}
