import {
  Tabs as MuiTabs,
  Tab,
  Box,
} from '@mui/material';
import { ReactNode } from 'react';

export interface TabItem {
  label: string;
  value: string;
  disabled?: boolean;
  icon?: ReactNode;
}

interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  items: TabItem[];
  variant?: 'standard' | 'scrollable' | 'fullWidth';
  orientation?: 'horizontal' | 'vertical';
}

export function Tabs({
  value,
  onChange,
  items,
  variant = 'standard',
  orientation = 'horizontal',
}: TabsProps) {
  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    onChange(newValue);
  };

  return (
    <Box
      sx={{
        borderBottom: orientation === 'horizontal' ? 1 : 0,
        borderColor: 'divider',
        mb: 2,
      }}
    >
      <MuiTabs
        value={value}
        onChange={handleChange}
        variant={variant}
        orientation={orientation}
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        {items.map((item) => (
          <Tab
            key={item.value}
            label={item.label}
            value={item.value}
            disabled={item.disabled}
            icon={item.icon as any}
            iconPosition={item.icon ? 'start' : undefined}
          />
        ))}
      </MuiTabs>
    </Box>
  );
}
