import { useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Chip,
  Button,
  Grid,
} from '@mui/material';
import { Clear } from '@mui/icons-material';
import { useQueryParams } from '@/hooks/state/useQueryParams';
import { useAsyncData } from '@/hooks/data/useAsyncData';
import { useResponsive } from '@/hooks/ui/useResponsive';
import { useAppData } from '@/contexts/AppDataContext';
import { apiClient } from '@/lib/apiClient';
import { filterStateToParams } from '@/lib/utils';
import { SearchInput } from '@/components/common/SearchInput';
import { PolicyList } from '@/components/policies/PolicyList';
import { FilterPanel } from '@/components/policies/FilterPanel';

export function PoliciesPage() {
  const { theme } = useResponsive();
  const { filters, updateFilters, resetFilters } = useQueryParams();

  // Context data
  const { categories, providers, platforms, ensureLoaded } = useAppData();

  // Effects
  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  // Data fetching
  const {
    data: policiesResponse,
    loading: policiesLoading,
    error: policiesError,
  } = useAsyncData(
    () => {
      const params = filterStateToParams(filters);
      return apiClient.listPolicies(params);
    },
    [filters],
    { immediate: true }
  );

  // Derived state
  const policies = policiesResponse?.data ?? [];
  const pagination = policiesResponse?.meta?.pagination;

  const filterOptions = useMemo(() => ({
    categories,
    providers,
    platforms,
  }), [categories, providers, platforms]);

  const activeFiltersCount = useMemo(
    () => filters.categories.length + filters.providers.length + filters.platforms.length,
    [filters.categories.length, filters.providers.length, filters.platforms.length]
  );

  // Event handlers
  const handlePageChange = useCallback((page: number) => {
    updateFilters({ page });
  }, [updateFilters]);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    updateFilters({ pageSize, page: 1 });
  }, [updateFilters]);

  const handleSearchChange = useCallback((search: string) => {
    updateFilters({ search, page: 1 });
  }, [updateFilters]);

  const handleFilterChange = useCallback((newFilters: Partial<typeof filters>) => {
    updateFilters(newFilters);
  }, [updateFilters]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Modern Header Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 50%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          py: { xs: 4, sm: 6, md: 8 },
          px: 0
        }}
      >
        <Container maxWidth={false} sx={{ maxWidth: '1600px', mx: 'auto', px: { xs: 2, sm: 3, md: 4 } }}>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, lg: 8 }}>
              <Typography
                variant="h2"
                component="h1"
                sx={{ 
                  fontWeight: 800, 
                  mb: 2,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                Policy Catalog
              </Typography>
              
              <Typography
                variant="h6"
                sx={{ 
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 400,
                  maxWidth: '600px'
                }}
              >
                Discover and explore API management policies for your WSO2 platform
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <Box sx={{ mt: { xs: 3, lg: 0 } }}>
                <Box
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                      '& fieldset': {
                        borderColor: 'rgba(255,255,255,0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255,255,255,0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgba(255,255,255,0.8)',
                      },
                      '& input': {
                        color: 'white',
                        '&::placeholder': {
                          color: 'rgba(255,255,255,0.7)',
                        },
                      },
                    },
                    '& .MuiInputAdornment-root svg': {
                      color: 'rgba(255,255,255,0.7)',
                    },
                  }}
                >
                  <SearchInput
                    value={filters.search}
                    onChange={handleSearchChange}
                    placeholder="Search policies by name, description, or category..."
                    size="medium"
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, py: 4 }}>
        {/* Results Header */}
        {(filters.search || activeFiltersCount > 0) && (
          <Container maxWidth={false} sx={{ maxWidth: '1600px', mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, mb: 4 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                py: 3,
                px: 4,
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: theme.shadows[2],
                border: `1px solid ${theme.palette.primary.main}25`
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: theme.palette.primary.main }}>
                  {`${policies.length} policies found`}
                </Typography>
              
                {/* Active Filters */}
                {(filters.search || activeFiltersCount > 0) && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      Active filters:
                    </Typography>
                    
                    {(() => {
                      const allFilters = [
                        ...(filters.search ? [{ type: 'search', value: filters.search, color: 'default' as const }] : []),
                        ...filters.categories.map(cat => ({ type: 'category', value: cat, color: 'warning' as const })),
                        ...filters.providers.map(provider => ({ type: 'provider', value: provider, color: 'info' as const })),
                        ...filters.platforms.map(platform => ({ type: 'platform', value: platform, color: 'success' as const }))
                      ];
                      
                      const visibleFilters = allFilters.slice(0, 4);
                      const hiddenCount = allFilters.length - 4;
                      
                      return (
                        <>
                          {visibleFilters.map((filter) => (
                            <Chip
                              key={`${filter.type}-${filter.value}`}
                              label={filter.value}
                              color={filter.color}
                              size="small"
                              onDelete={() => {
                                if (filter.type === 'search') {
                                  updateFilters({ search: '' });
                                } else if (filter.type === 'category') {
                                  updateFilters({ 
                                    categories: filters.categories.filter(c => c !== filter.value) 
                                  });
                                } else if (filter.type === 'provider') {
                                  updateFilters({ 
                                    providers: filters.providers.filter(p => p !== filter.value) 
                                  });
                                } else if (filter.type === 'platform') {
                                  updateFilters({ 
                                    platforms: filters.platforms.filter(p => p !== filter.value) 
                                  });
                                }
                              }}
                              sx={{
                                '& .MuiChip-deleteIcon': {
                                  color: 'inherit',
                                  opacity: 0.7,
                                  '&:hover': {
                                    opacity: 1,
                                  }
                                }
                              }}
                            />
                          ))}
                          {hiddenCount > 0 && (
                            <Chip
                              label={`+${hiddenCount} more`}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderColor: theme.palette.primary.main,
                                color: theme.palette.primary.main
                              }}
                            />
                          )}
                        </>
                      );
                    })()}
                  </Box>
                )}
              </Box>

              {/* Clear All Button */}
              {(filters.search || activeFiltersCount > 0) && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Clear />}
                  onClick={resetFilters}
                  sx={{
                    ml: 2,
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      borderColor: theme.palette.primary.dark,
                      bgcolor: `${theme.palette.primary.main}08`
                    }
                  }}
                >
                  Clear All
                </Button>
              )}
            </Box>
          </Container>
        )}

        {/* Main Content Grid - Full Width */}
        <Container maxWidth={false} sx={{ maxWidth: '1600px', mx: 'auto', px: { xs: 2, sm: 3, md: 4 } }}>
          <Grid 
            container 
            spacing={{ xs: 3, md: 4 }}
            columns={{ xs: 1, lg: 12 }}
            sx={{ minHeight: '60vh' }}
          >
            {/* Left-aligned Filter Sidebar */}
            <Grid size={{ xs: 1, lg: 3 }}>
              <Box sx={{
                position: { lg: 'sticky' },
                top: '2rem',
                maxHeight: { lg: 'calc(100vh - 200px)' },
                overflowY: { lg: 'auto' },
                bgcolor: 'background.paper',
                borderRadius: 3,
                boxShadow: theme.shadows[3],
                border: `1px solid ${theme.palette.primary.main}12`
              }}>
                <FilterPanel
                  filters={filters}
                  availableCategories={filterOptions.categories.filter((cat): cat is string => cat !== undefined)}
                  availableProviders={filterOptions.providers}
                  availablePlatforms={filterOptions.platforms.filter(Boolean) as string[]}
                  onChange={handleFilterChange}
                  isLoading={policiesLoading}
                />
              </Box>
            </Grid>
            
            {/* Policy List - Wider Cards */}
            <Grid size={{ xs: 1, lg: 9 }}>
              <PolicyList
                policies={policies}
                isLoading={policiesLoading}
                error={policiesError}
                pagination={pagination}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                onClearFilters={resetFilters}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
