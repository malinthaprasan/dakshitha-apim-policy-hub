import {
  Box,
  Typography,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Chip,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
} from '@mui/material';
import { 
  ExpandMore, 
  KeyboardArrowDown,
  KeyboardArrowUp 
} from '@mui/icons-material';
import { FilterState } from '@/lib/types';
import { useTheme } from '@mui/material/styles';
import { capitalize } from '@/lib/utils';
import { useState, useCallback } from 'react';
import { UI_LIMITS } from '@/lib/constants';

interface FilterPanelProps {
  filters: FilterState;
  availableCategories?: string[];
  availableProviders?: string[];
  availablePlatforms?: string[];
  onChange: (filters: Partial<FilterState>) => void;
  isLoading?: boolean;
}

function FilterPanel({
  filters,
  availableCategories = [],
  availableProviders = [],
  availablePlatforms = [],
  onChange,
  isLoading = false,
}: FilterPanelProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for collapsible sections
  const [isShowAllCategories, setIsShowAllCategories] = useState(false);
  const [isShowAllProviders, setIsShowAllProviders] = useState(false);
  const [isShowAllPlatforms, setIsShowAllPlatforms] = useState(false);

  const activeFiltersCount = 
    filters.categories.length + 
    filters.providers.length + 
    filters.platforms.length;

  const handleCheckboxChange = useCallback((
    filterType: 'categories' | 'providers' | 'platforms',
    value: string,
    checked: boolean
  ) => {
    const currentValues = filters[filterType];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(item => item !== value);
    
    onChange({ [filterType]: newValues });
  }, [filters, onChange]);

  const handleClearFilterType = useCallback((filterType: 'categories' | 'providers' | 'platforms') => {
    onChange({ [filterType]: [] });
  }, [onChange]);

  const renderCheckboxGroup = (
    title: string,
    items: string[],
    selectedItems: string[],
    filterType: 'categories' | 'providers' | 'platforms',
    maxVisible: number,
    showAll: boolean,
    setShowAll: (show: boolean) => void
  ) => {
    const visibleItems = showAll ? items : items.slice(0, maxVisible);
    const hasMore = items.length > maxVisible;
    const hasSelected = selectedItems.length > 0;

    return (
      <Box 
        sx={{ 
          mb: 20,
          p: 3,
          pb: 2,
          bgcolor: 'background.paper',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: theme.shadows[2],
          backdropFilter: 'blur(20px)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
          },
          '&:hover': {
            boxShadow: `0 8px 30px ${theme.palette.primary.main}25`,
          }
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 1.5 
          }}
        >
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600,
              color: 'text.primary',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            {title}
            <Chip
              label={`${items.length} available`}
              size="small"
              variant="outlined"
              sx={{ 
                height: 20, 
                fontSize: '0.65rem',
                color: 'text.secondary',
                borderColor: 'divider'
              }}
            />
            {hasSelected && (
              <Chip
                label={`${selectedItems.length} selected`}
                size="small"
                color="primary"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            )}
          </Typography>
          
          {hasSelected && (
            <Button
              size="small"
              onClick={() => handleClearFilterType(filterType)}
              disabled={isLoading}
              sx={{ 
                minWidth: 'auto',
                p: 0.5,
                fontSize: '0.75rem',
                textDecoration: 'underline'
              }}
            >
              Clear
            </Button>
          )}
        </Box>

        <FormControl component="fieldset" disabled={isLoading}>
          <FormGroup>
            {visibleItems.map((item) => (
              <FormControlLabel
                key={item}
                control={
                  <Checkbox
                    checked={selectedItems.includes(item)}
                    onChange={(e) => 
                      handleCheckboxChange(filterType, item, e.target.checked)
                    }
                    size="small"
                    sx={{
                      transition: 'all 0.15s ease-in-out',
                      '&.Mui-checked': {
                        color: 'primary.main',
                      },
                    }}
                  />
                }
                label={
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.875rem',
                      color: selectedItems.includes(item) 
                        ? 'text.primary' 
                        : 'text.secondary',
                      transition: 'color 0.15s ease-in-out'
                    }}
                  >
                    {capitalize(item)}
                  </Typography>
                }
                sx={{ 
                  ml: 0,
                  mr: 0,
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.875rem'
                  }
                }}
              />
            ))}
            
            {/* Show more button - consistently aligned */}
            {hasMore && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 0, mr: 1, ml: 3 }}>
                <Button
                  size="small"
                  onClick={() => setShowAll(!showAll)}
                  endIcon={showAll ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                  variant="text"
                  sx={{ 
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    color: 'primary.main',
                    fontWeight: 500,
                    minHeight: 28,
                    px: 1,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'primary.50'
                    },
                    '& .MuiButton-endIcon': {
                      ml: 0.5,
                      fontSize: '0.9rem'
                    }
                  }}
                >
                  {showAll 
                    ? `Show fewer` 
                    : `Show ${items.length - maxVisible} more`
                  }
                </Button>
              </Box>
            )}
          </FormGroup>
        </FormControl>
      </Box>
    );
  };



  const filterContent = (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: { xs: 2, sm: 3 },
          pb: { xs: 1, sm: 1.5 },
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            color: 'text.primary'
          }}
        >
          Filters
        </Typography>
      </Box>

      <Stack spacing={{ xs: 2.5, sm: 3 }}>
        {availableCategories.length > 0 && renderCheckboxGroup(
          'Categories',
          availableCategories,
          filters.categories,
          'categories',
          UI_LIMITS.MAX_CATEGORIES_VISIBLE,
          isShowAllCategories,
          setIsShowAllCategories
        )}

        {availableProviders.length > 0 && renderCheckboxGroup(
          'Providers', 
          availableProviders,
          filters.providers,
          'providers',
          UI_LIMITS.MAX_PROVIDERS_VISIBLE,
          isShowAllProviders,
          setIsShowAllProviders
        )}

        {availablePlatforms.length > 0 && renderCheckboxGroup(
          'Platforms',
          availablePlatforms,
          filters.platforms,
          'platforms',
          UI_LIMITS.MAX_PLATFORMS_VISIBLE,
          isShowAllPlatforms,
          setIsShowAllPlatforms
        )}        {/* Show platforms section even if no data available */}
        {availablePlatforms.length === 0 && (
          <Box 
            sx={{ 
              p: 2,
              backgroundColor: 'background.default',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              textAlign: 'center'
            }}
          >
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 600,
                color: 'text.secondary',
                mb: 1
              }}
            >
              Platforms
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                fontStyle: 'italic'
              }}
            >
              Platform filter coming soon
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );

  if (isMobile) {
    return (
      <Accordion 
        sx={{ 
          mb: { xs: 2, sm: 3 },
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid',
          borderColor: 'divider',
          '&:before': {
            display: 'none',
          },
          '&.Mui-expanded': {
            margin: 0,
            mb: { xs: 2, sm: 3 },
          }
        }}
      >
        <AccordionSummary 
          expandIcon={<ExpandMore />}
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
            '& .MuiAccordionSummary-content': {
              alignItems: 'center'
            },
            '& .MuiAccordionSummary-expandIconWrapper': {
              color: 'primary.main'
            }
          }}
        >
          <Typography 
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'text.primary'
            }}
          >
            Filters
            {activeFiltersCount > 0 && (
              <Chip
                label={activeFiltersCount}
                size="small"
                color="primary"
                sx={{ 
                  height: 20,
                  fontSize: '0.7rem',
                  fontWeight: 600
                }}
              />
            )}
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: { xs: 2, sm: 3 }, pt: 0 }}>
          {filterContent}
        </AccordionDetails>
      </Accordion>
    );
  }

  return (
    <Box
      sx={{
        height: 'fit-content',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: { xs: 2, sm: 3 },
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        transition: 'box-shadow 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
        }
      }}
    >
      {filterContent}
    </Box>
  );
}

export { FilterPanel };
