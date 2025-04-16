import { createTheme, alpha } from "@mui/material";
import type { ISourceOptions } from "@tsparticles/engine";

// Create a custom dark theme with Twitch-inspired colors
export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#9147ff",
    },
    secondary: {
      main: "#a970ff",
    },
    background: {
      default: "#0e0e10",
      paper: "#18181b",
    },
    text: {
      primary: "#ffffff",
      secondary: "#adadb8",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 4,
          fontWeight: 500,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        contained: {
          "&:hover": {
            backgroundColor: "#a970ff",
          },
        },
        outlined: {
          // Make default border and text slightly brighter
          borderColor: alpha("#9147ff", 0.6), // Use primary color with alpha
          color: alpha("#ffffff", 0.9), // Slightly less bright white text
          "&:hover": {
            borderColor: "#9147ff", // Full primary color on hover
            backgroundColor: alpha("#9147ff", 0.1), // Slightly more intense background on hover
            color: "#ffffff", // Full white text on hover
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#3a3a3d",
            },
            "&:hover fieldset": {
              borderColor: "#5c5c5e",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#9147ff",
            },
            backgroundColor: "#0e0e10",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderColor: "#2d2d32",
          backdropFilter: "blur(8px)",
          backgroundColor: alpha("#18181b", 0.8),
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "#3a3a3d",
          "&.Mui-checked": {
            color: "#9147ff",
          },
        },
      },
    },
  },
});

// Note: The request mentioned { useStyles }, but the current component primarily uses
// inline `sx` props and a ThemeProvider. If more complex, component-specific styles
// were needed, a useStyles hook (e.g., using tss-react or similar) could be added here.
// For now, just exporting the theme is sufficient.

// Particle options extracted from Login.tsx
export const particleOptions: ISourceOptions = {
  fullScreen: false, // Ensure this is false to contain within the Box
  background: {
    color: {
      value: "#0e0e10",
    },
  },
  fpsLimit: 60,
  particles: {
    color: {
      value: "#9147ff",
    },
    links: {
      color: "#9147ff",
      distance: 150,
      enable: true,
      opacity: 0.3,
      width: 1,
    },
    collisions: {
      enable: false,
    },
    move: {
      direction: "none",
      enable: true,
      outModes: {
        default: "bounce",
      },
      random: true,
      speed: 1,
      straight: false,
    },
    number: {
      density: {
        enable: true,
      },
      value: 80,
    },
    opacity: {
      value: 0.3,
    },
    shape: {
      type: "circle",
    },
    size: {
      value: { min: 1, max: 3 },
    },
  },
  detectRetina: true,
};
