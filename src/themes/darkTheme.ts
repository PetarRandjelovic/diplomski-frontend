'use client';
import { createTheme } from '@mui/material/styles';


const darkTheme = createTheme({
    cssVariables: true,
    typography: {
        allVariants: {
          color: '#080707', // Global font color set to white
        },
        fontFamily: 'Roboto, Arial, sans-serif',
      },
      palette: {
        text: {
          primary: '#080707', // Text fields and labels in white
        },
      },
  });

  export default darkTheme;