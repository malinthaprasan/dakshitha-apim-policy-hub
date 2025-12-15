import { Chip, ChipProps } from '@mui/material';
import { capitalize } from '@/lib/utils';

interface TagProps extends Omit<ChipProps, 'label'> {
  label: string;
  variant?: 'filled' | 'outlined';
}

export function Tag({ label, variant = 'filled', ...props }: TagProps) {
  return (
    <Chip
      label={capitalize(label)}
      variant={variant}
      size="small"
      {...props}
      sx={{
        fontSize: '0.7rem',
        height: 26,
        fontWeight: 600,
        letterSpacing: '0.02em',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-1px)',
          ...(variant === 'filled' && {
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          }),
        },
        '& .MuiChip-label': {
          px: 1.25,
        },
        ...props.sx,
      }}
    />
  );
}
