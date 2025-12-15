import { Box, Pagination, FormControl, Select, MenuItem, Typography, Stack } from '@mui/material';
import { PaginationMeta } from '@/lib/types';

interface PaginationControlsProps {
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export function PaginationControls({
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
}: PaginationControlsProps) {
  if (!pagination) return null;

  const { page, pageSize, totalPages, totalItems } = pagination;
  
  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    onPageChange?.(value);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newPageSize = event.target.value as number;
    onPageSizeChange?.(newPageSize);
  };

  if (totalItems === 0 || totalPages <= 1) return null;

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'center', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        py: 2,
      }}
    >
      {/* Results info */}
      <Typography variant="body2" color="text.secondary">
        Showing {startItem}-{endItem} of {totalItems} results
      </Typography>

      {/* Pagination controls */}
      <Stack direction="row" alignItems="center" spacing={2}>
        {/* Page size selector */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Show:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 60 }}>
            <Select
              value={pageSize}
              onChange={handlePageSizeChange as any}
              variant="outlined"
            >
              {pageSizeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Page navigation */}
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
          size="medium"
          showFirstButton
          showLastButton
          siblingCount={1}
          boundaryCount={1}
        />
      </Stack>
    </Box>
  );
}
