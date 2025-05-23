import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import { Gamepad2, Twitch } from "lucide-react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";
import { particleOptions } from "./Login.styles"; // Import particleOptions only
import { useThemeContext } from "../ThemeProvider"; // Import theme context

export default function Login() {
  const theme = useTheme(); // Get current theme
  const { themeMode, setThemeMode } = useThemeContext(); // Get theme context

  // Force dark mode for login page
  useEffect(() => {
    // Store the current theme mode
    const currentTheme = themeMode;
    // Set dark mode for login page
    setThemeMode("dark");

    // Restore original theme when component unmounts
    return () => {
      setThemeMode(currentTheme);
    };
  }, [themeMode, setThemeMode]);

  const handleTwitchLogin = () => {
    window.location.href = "/api/auth/twitch";
  };

  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    })
      .then(() => {
        setInit(true);
      })
      .catch((error) => {
        console.error("Particles engine initialization failed:", error);
      });
  }, []);

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          bgcolor: "background.default", // Use theme background color
        }}
      >
        {init ? (
          <Particles
            id="tsparticles"
            options={particleOptions}
            style={{ width: "100%", height: "100%" }}
          />
        ) : null}
      </Box>
      <Container
        component="main"
        maxWidth="xs"
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Gamepad2 color={theme.palette.primary.main} size={32} />
            <Typography component="h1" variant="h4" fontWeight="bold">
              MiniGameMaster
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Sign in to manage your bot
          </Typography>
        </Box>

        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
          }}
        >
          <Box sx={{ mt: 1, display: "flex", justifyContent: "center" }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={
                <Twitch color={theme.palette.primary.main} size={16} />
              }
              onClick={handleTwitchLogin}
              sx={{
                py: 1,
                fontSize: "0.95rem",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                },
              }}
            >
              Sign in with Twitch
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );
}
