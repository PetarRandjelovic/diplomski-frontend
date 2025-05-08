'use client';
import { useState } from "react";
import { loginUser } from "@/services/auth";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Container, TextField, Button, Typography, Box, Alert } from '@mui/material';
import theme from "@/themes/lightTheme";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    setError(null);
    try {
      const response = await loginUser(email, password);
      if (response) {
       // console.log('User logged in:', response);
        // Handle successful login, e.g., save token, redirect

        localStorage.setItem('authToken', response.token);
       
        localStorage.setItem('userEmail', email); // or dynamic


       router.push('/home'); 
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleSignUpRedirect = () => {
    router.push('/sign-up'); // Redirect to the sign-up route
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="h4" component="h1">
            Login
          </Typography>
          {error && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          )}
          <TextField
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleLogin}
          >
            Login
          </Button>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSignUpRedirect}
          >
            Create new account
          </Button>
        </Box>
     
      </Container>
    </ThemeProvider>
  );
};

export default LoginPage;
