// src/assets/jss/material-dashboard-react.js
import { createTheme } from '@mui/material/styles'; // <--- THIS IS CRUCIAL

const theme = createTheme({
  palette: {
    mode: 'light', // or 'dark'
    primary: {
      main: '#4CAF50', // Example green
    },
    secondary: {
      main: '#FFC107', // Example amber
    },
    background: { // Ensure background properties exist
      default: '#f4f5f7', // Light mode default
      paper: '#ffffff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
    },
  },
  typography: {
    // Ensure typography properties are defined
    fontFamily: ['Roboto', 'sans-serif'].join(','),
    h1: { fontSize: '2.5rem', fontWeight: 700 },
    h2: { fontSize: '2rem', fontWeight: 700 },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    h5: { fontSize: '1.25rem', fontWeight: 500 },
    h6: { fontSize: '1rem', fontWeight: 500 },
    body1: { fontSize: '0.9rem' },
    body2: { fontSize: '0.8rem' },
    button: {
        textTransform: 'none', // Common corporate preference
        fontWeight: 600,
    },
    // If you explicitly used 'fontWeightBold' somewhere, ensure it's mapped or replace it.
    // MUI usually uses fontWeight numbers (e.g., 700) or 'bold' directly.
    // If material-dashboard-react defines a custom property like 'fontWeightBold',
    // you might need to adjust where it's used or ensure it's part of the typography variant.
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Example rounded buttons
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Example rounded cards
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)' // Subtle shadow
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined', // Default all text fields to outlined
      },
    },
    // ... add more component overrides as needed
  },
});

export default theme;