"use client";

import { useRouter } from "next/navigation";
import darkTheme from "@/themes/darkTheme";
import { ThemeProvider } from "@emotion/react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";

const MyAccountPage = () => {
  const router = useRouter(); // useRouter should be inside the component

  // Handlers should use the `router` inside the component
  const handleHome = () => {
    router.push("/home");
  };

  const handleMyAccount = () => {
    router.push("/myAccount");
  };

  const handleExplore = () => {
    router.push("/explore");
  };

  const handleMessages = () => {
    router.push("/messages");
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            My App
          </Typography>
          <Button color="inherit" onClick={handleHome}>
            Home
          </Button>
          <Button color="inherit" onClick={handleMyAccount}>
            My Account
          </Button>
          <Button color="inherit" onClick={handleExplore}>
            Explore
          </Button>
          <Button color="inherit" onClick={handleMessages}>
            Messages
          </Button>
        </Toolbar>
      </AppBar>
      <div>
        <h1>My Account</h1>
      </div>
    </ThemeProvider>
  );
};

export default MyAccountPage;
