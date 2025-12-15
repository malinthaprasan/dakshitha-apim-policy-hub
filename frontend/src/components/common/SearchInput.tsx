import { useState, useEffect, useCallback } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import { useDebouncedValue } from '@/hooks/ui/useDebouncedValue';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search policies...',
  debounceMs = 300,
  fullWidth = true,
  size = 'medium',
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(value);
  const debouncedValue = useDebouncedValue(internalValue, debounceMs);

  // Update internal value when external value changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Call onChange when debounced value changes
  useEffect(() => {
    if (debouncedValue.value !== value) {
      onChange(debouncedValue.value);
    }
  }, [debouncedValue, value, onChange]);

  const handleClear = useCallback(() => {
    setInternalValue('');
    onChange('');
  }, [onChange]);

  return (
    <TextField
      value={internalValue}
      onChange={(e) => setInternalValue(e.target.value)}
      placeholder={placeholder}
      fullWidth={fullWidth}
      size={size}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search color="action" />
          </InputAdornment>
        ),
        endAdornment: internalValue && (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={handleClear}
              aria-label="Clear search"
            >
              <Clear fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}
