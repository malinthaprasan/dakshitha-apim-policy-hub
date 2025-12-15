
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
}

export function ThemeToggle({ 
  size = 'medium', 
  showTooltip = true 
}: ThemeToggleProps) {
  const { mode, toggleTheme } = useTheme();

  const icon = mode === 'light' ? <Brightness4 /> : <Brightness7 />;
  const tooltipText = mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode';

  const button = (
    <IconButton
      onClick={toggleTheme}
      color="inherit"
      size={size}
      aria-label={tooltipText}
    >
      {icon}
    </IconButton>
  );

  if (showTooltip) {
    return (
      <Tooltip title={tooltipText} placement="bottom">
        {button}
      </Tooltip>
    );
  }

  return button;
}
