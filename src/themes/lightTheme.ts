'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    cssVariables: true,
    typography: {
        allVariants: {
          color: '#FFFFFF', // Global font color set to white
        },
        fontFamily: 'Roboto, Arial, sans-serif',
      },
      palette: {
        text: {
          primary: '#FFFFFF', // Text fields and labels in white
        },
      },
  });
  export default theme;



