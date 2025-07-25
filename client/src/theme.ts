import { createTheme } from '@mui/material/styles';

// Extend the theme interface to include custom colors
declare module '@mui/material/styles' {
  interface Palette {
    border: {
      light: string;
      main: string;
    };
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
  }

  interface PaletteOptions {
    border?: {
      light?: string;
      main?: string;
    };
  }
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#036CA3', // Your original blue color
      light: '#4A94C0',
      dark: '#024B73',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#3d82f7', // Your preferred blue color
      light: '#6fa4f9',
      dark: '#2b5cbf',
      contrastText: '#ffffff',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: '#ffffff',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
      contrastText: '#ffffff',
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    background: {
      default: '#f7f8fa', // Your original background color
      paper: '#ffffff',
    },
    text: {
      primary: '#2d3748', // Your original text color
      secondary: '#718096', // Your original secondary text
      disabled: '#9e9e9e',
    },
    border: {
      light: '#e0e3e7', // Your original border color
      main: '#bdbdbd',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
          padding: '8px 24px',
        },
        contained: {
          boxShadow: 'none',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(33, 150, 243, 0.2)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              pointerEvents: 'none',
            },
          },
          '&:active': {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              pointerEvents: 'none',
            },
          },
        },
        outlined: {
          borderWidth: '1.5px',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            borderWidth: '1.5px',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(33, 150, 243, 0.04)',
              pointerEvents: 'none',
            },
          },
          '&:active': {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(33, 150, 243, 0.08)',
              pointerEvents: 'none',
            },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: '#e0e3e7',
              borderWidth: '1.5px',
              transition: 'border-color 0.35s cubic-bezier(0.4,0,0.2,1), border-width 0.25s cubic-bezier(0.4,0,0.2,1)',
            },
            '&:hover fieldset': {
              borderColor: '#036CA3',
              borderWidth: '2px',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#036CA3',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          '&.MuiChip-colorSuccess': {
            '& .MuiChip-label': {
              color: '#ffffff',
            },
          },
          '&.MuiChip-colorWarning': {
            '& .MuiChip-label': {
              color: '#ffffff',
            },
          },
        },
      },
    },
  },
});

export default theme;