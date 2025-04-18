import React from "react";
import {
  ThemeProvider as MUIThemeProvider,
  createTheme,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Create a theme based on the inspiration code
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#5e35b1", // deep purple
      light: "#9162e4",
      dark: "#280680",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#00b0ff", // light blue
      light: "#69e2ff",
      dark: "#0081cb",
      contrastText: "#ffffff",
    },
    error: {
      main: "#f44336",
      light: "#ffcdd2",
      dark: "#d32f2f",
    },
    success: {
      main: "#4caf50",
      light: "#c8e6c9",
      dark: "#2e7d32",
    },
    warning: {
      main: "#ff9800",
      light: "#ffe0b2",
      dark: "#ef6c00",
    },
    info: {
      main: "#2196f3",
      light: "#bbdefb",
      dark: "#0d47a1",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    text: {
      primary: "#212121",
      secondary: "#757575",
    },
    divider: "rgba(0, 0, 0, 0.08)",
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          padding: "8px 16px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(45deg, #5e35b1 30%, #7c4dff 90%)",
        },
        containedSecondary: {
          background: "linear-gradient(45deg, #00b0ff 30%, #40c4ff 90%)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
          overflow: "visible",
          height: "100%", // Keep height 100% for consistency if needed
          display: "flex", // Keep flex display if needed
          flexDirection: "column", // Keep flex direction if needed
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 24,
          "&:last-child": {
            paddingBottom: 24,
          },
          flexGrow: 1, // Keep flexGrow if needed
        },
      },
    },
    MuiCardActions: {
      styleOverrides: {
        root: {
          padding: "0 24px 24px",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#280680", // dark purple
          color: "#ffffff",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: "4px 8px",
          "&.Mui-selected": {
            backgroundColor: "rgba(255, 255, 255, 0.16)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.24)",
            },
          },
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.08)",
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: "inherit",
          minWidth: 40,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        outlined: {
          borderRadius: 8,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 42,
          height: 26,
          padding: 0,
        },
        switchBase: {
          padding: 1,
          "&.Mui-checked": {
            transform: "translateX(16px)",
            color: "#fff",
            "& + .MuiSwitch-track": {
              opacity: 1,
              backgroundColor: "#5e35b1",
            },
          },
        },
        thumb: {
          width: 24,
          height: 24,
        },
        track: {
          borderRadius: 13,
          opacity: 1,
          backgroundColor: "#757575",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    // Keep other component overrides from the original file if they are still relevant
    // MuiAppBar: { ... } // Example: Keep if you still need specific AppBar styles not covered by the new theme
  },
});

interface CustomThemeProviderProps {
  children: React.ReactNode;
}

// Simplified Theme Provider using the static theme
export const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({
  children,
}) => {
  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
};

// Export a dummy context hook to avoid breaking imports, though it won't do anything
// You might need to refactor components that were using the old context
export const useThemeContext = () => ({
  themeMode: "light", // Always light now
  setThemeMode: () => {},
  toggleThemeMode: () => {},
});
