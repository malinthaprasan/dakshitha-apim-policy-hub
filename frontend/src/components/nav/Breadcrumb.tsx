import {
  Breadcrumbs,
  Link,
  Typography,
  Box,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { NavigateNext } from '@mui/icons-material';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" />}
        aria-label="breadcrumb"
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          if (isLast || item.current || !item.path) {
            return (
              <Typography
                key={index}
                color="text.primary"
                sx={{ fontWeight: 500 }}
              >
                {item.label}
              </Typography>
            );
          }
          
          return (
            <Link
              key={index}
              component={RouterLink}
              to={item.path}
              underline="hover"
              color="inherit"
              sx={{
                textDecoration: 'none',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}
