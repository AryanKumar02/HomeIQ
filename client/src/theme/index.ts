import { createTheme } from '@mui/material/styles'

// Augment the Palette interface to include our custom background color
declare module '@mui/material/styles' {
  interface TypeBackground {
    section?: string
  }
  interface PaletteOptions {
    background?: Partial<TypeBackground>
  }
  interface Palette {
    background: TypeBackground
  }
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#036CA3', // Your brand color
    },
    secondary: {
      main: '#3d82f7',
    },
    background: {
      default: '#f5f5f5',
      section: '#f5f8ff', // Added new section background color
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '0.02em',
    },
    button: {
      textTransform: 'none', // No uppercase
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          scrollBehavior: 'smooth',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingTop: '0.65em',
          paddingBottom: '0.65em',
          fontSize: '1rem',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          fontSize: '0.98rem',
          padding: '7px 16px',
          minHeight: 'unset',
          lineHeight: 1.5,
          backdropFilter: 'blur(4px)',
          background: 'rgba(255, 255, 255, 0.45)',
          boxShadow: '0 2px 8px 0 rgba(220,53,69,0.08)',
          display: 'flex',
          alignItems: 'center',
        },
        standardError: {
          background: 'rgba(255, 76, 76, 0.09)',
          color: '#b71c1c',
          border: '1px solid #ffb3b3',
          boxShadow: '0 1px 6px 0 rgba(220,53,69,0.06)',
        },
        filledError: {
          background: 'rgba(255, 76, 76, 0.13)',
          color: '#b71c1c',
        },
        outlinedError: {
          background: 'rgba(255, 76, 76, 0.05)',
          color: '#b71c1c',
          border: '1px solid #ffb3b3',
          boxShadow: '0 1.5px 8px 0 rgba(220,53,69,0.07)',
        },
      },
    },
  },
})

export default theme
