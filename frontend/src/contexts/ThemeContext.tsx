import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from '@/lib/theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Get initial theme from localStorage or default to light
  const [mode, setMode] = useState<ThemeMode>(() => {
    try {
      const savedMode = localStorage.getItem('theme-mode') as ThemeMode;
      return savedMode || 'light';
    } catch {
      return 'light';
    }
  });

  // Save theme preference to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('theme-mode', mode);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }, [mode]);

  // Toggle between light and dark themes
  const toggleTheme = useCallback(() => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  }, []);

  // Set specific theme mode
  const setTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
  }, []);

  // Select the appropriate theme based on mode - useMemo for expensive theme object
  const theme = useMemo(() => mode === 'light' ? lightTheme : darkTheme, [mode]);

  const value = useMemo<ThemeContextValue>(() => ({
    mode,
    toggleTheme,
    setTheme,
  }), [mode, toggleTheme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
