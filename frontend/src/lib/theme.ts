import { createTheme, ThemeOptions } from '@mui/material/styles';

type PaletteMode = 'light' | 'dark';

// WSO2 Official Brand Colors
const wso2Colors = {
  // Primary WSO2 Orange
  orange: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#FF7300', // Main WSO2 Orange
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },
  // WSO2 Charcoal/Dark
  charcoal: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  // WSO2 Blue Accent
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
};

// Brand Colors Configuration
const brandColors = {
  primary: {
    main: wso2Colors.orange[500], // WSO2 Orange
    light: wso2Colors.orange[400],
    dark: wso2Colors.orange[700],
    contrastText: '#ffffff',
    50: wso2Colors.orange[50],
    100: wso2Colors.orange[100],
    200: wso2Colors.orange[200],
    300: wso2Colors.orange[300],
    400: wso2Colors.orange[400],
    500: wso2Colors.orange[500],
    600: wso2Colors.orange[600],
    700: wso2Colors.orange[700],
    800: wso2Colors.orange[800],
    900: wso2Colors.orange[900],
  },
  secondary: {
    main: wso2Colors.charcoal[700],
    light: wso2Colors.charcoal[500],
    dark: wso2Colors.charcoal[800],
    contrastText: '#ffffff',
  },
  error: {
    main: '#DC2626',
    light: '#EF4444',
    dark: '#B91C1C',
  },
  warning: {
    main: '#D97706',
    light: '#F59E0B',
    dark: '#B45309',
  },
  info: {
    main: wso2Colors.blue[600],
    light: wso2Colors.blue[400],
    dark: wso2Colors.blue[800],
  },
  success: {
    main: '#059669',
    light: '#10B981',
    dark: '#047857',
  },
};

// Light theme palette
const lightPalette = {
  mode: 'light' as PaletteMode,
  ...brandColors,
  background: {
    default: '#FAFAFA',
    paper: '#FFFFFF',
  },
  text: {
    primary: wso2Colors.charcoal[800],
    secondary: '#757575',
  },
  divider: '#E0E0E0',
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

// Dark theme palette
const darkPalette = {
  mode: 'dark' as PaletteMode,
  ...brandColors,
  primary: {
    ...brandColors.primary,
    main: wso2Colors.orange[400], // Lighter orange for dark mode
    light: wso2Colors.orange[300],
    contrastText: wso2Colors.charcoal[900],
  },
  background: {
    default: wso2Colors.charcoal[900],
    paper: wso2Colors.charcoal[800],
  },
  text: {
    primary: '#FFFFFF',
    secondary: wso2Colors.charcoal[300],
  },
  divider: wso2Colors.charcoal[700],
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

// Common theme configuration
const getThemeConfig = (mode: PaletteMode): ThemeOptions => {
  const palette = mode === 'light' ? lightPalette : darkPalette;
  
  return {
    palette,
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h4: {
        fontSize: '1.25rem',
        fontWeight: 500,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.125rem',
        fontWeight: 500,
        lineHeight: 1.5,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.5,
      },
      subtitle1: {
        fontSize: '1rem',
        fontWeight: 400,
        lineHeight: 1.5,
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: 1.5,
      },
      body1: {
        fontSize: '1rem',
        fontWeight: 400,
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: 1.6,
      },
      caption: {
        fontSize: '0.75rem',
        fontWeight: 400,
        lineHeight: 1.4,
      },
      button: {
        fontSize: '0.875rem',
        fontWeight: 500,
        textTransform: 'none' as const,
      },
    },
    shape: {
      borderRadius: 8,
    },
    spacing: 8,
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            padding: '8px 16px',
            fontWeight: 500,
          },
          containedPrimary: {
            background: mode === 'light' 
              ? 'linear-gradient(135deg, #FF7300 0%, #FF9340 100%)'
              : 'linear-gradient(135deg, #FF9340 0%, #FFB366 100%)',
            '&:hover': {
              background: mode === 'light'
                ? 'linear-gradient(135deg, #E65100 0%, #FF7300 100%)'
                : 'linear-gradient(135deg, #FF7300 0%, #FF9340 100%)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: mode === 'light' 
              ? '0 2px 12px rgba(0, 0, 0, 0.08)'
              : '0 2px 12px rgba(0, 0, 0, 0.25)',
            border: `1px solid ${mode === 'light' ? '#E0E0E0' : '#333333'}`,
            '&:hover': {
              boxShadow: mode === 'light'
                ? '0 4px 20px rgba(0, 0, 0, 0.12)'
                : '0 4px 20px rgba(0, 0, 0, 0.35)',
              borderColor: mode === 'light' ? '#BDBDBD' : '#555555',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontSize: '0.75rem',
            height: 24,
          },
          colorPrimary: {
            backgroundColor: mode === 'light' ? '#FFF3E0' : '#2D1B0E',
            color: mode === 'light' ? '#E65100' : '#FF9340',
            '&:hover': {
              backgroundColor: mode === 'light' ? '#FFE0B2' : '#3D2518',
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.875rem',
            minHeight: 48,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow: mode === 'light' 
              ? '0 2px 4px rgba(0, 0, 0, 0.1)'
              : '0 2px 4px rgba(0, 0, 0, 0.3)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#FFFFFF' : '#1E1E1E',
            color: mode === 'light' ? '#212121' : '#FFFFFF',
            boxShadow: mode === 'light' 
              ? '0 1px 3px rgba(0, 0, 0, 0.1)'
              : '0 1px 3px rgba(0, 0, 0, 0.3)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            fontSize: '0.875rem',
          },
        },
      },
      MuiFormControl: {
        styleOverrides: {
          root: {
            marginBottom: 16,
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            marginBottom: 4,
            '&:hover': {
              backgroundColor: mode === 'light' ? '#F5F5F5' : '#2A2A2A',
            },
          },
        },
      },
      MuiBreadcrumbs: {
        styleOverrides: {
          root: {
            fontSize: '0.875rem',
          },
        },
      },
    },
  };
};

// Create themes
export const lightTheme = createTheme(getThemeConfig('light'));
export const darkTheme = createTheme(getThemeConfig('dark'));

// Default export for backward compatibility
export default lightTheme;
