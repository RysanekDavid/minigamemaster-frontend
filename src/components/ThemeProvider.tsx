import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import {
  ThemeProvider as MUIThemeProvider,
  createTheme,
  Theme,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Define theme settings
const getDesignTokens = (mode: "light" | "dark") => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          // Light mode palette
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
        }
      : {
          // Dark mode palette
          primary: {
            main: "#9147ff", // Twitch purple
            light: "#a970ff",
            dark: "#7232c9",
            contrastText: "#ffffff",
          },
          secondary: {
            main: "#00b0ff",
            light: "#69e2ff",
            dark: "#0081cb",
            contrastText: "#ffffff",
          },
          error: {
            main: "#f44336",
            light: "#f88078",
            dark: "#d32f2f",
          },
          success: {
            main: "#4caf50",
            light: "#7bc67e",
            dark: "#2e7d32",
          },
          warning: {
            main: "#ff9800",
            light: "#ffb74d",
            dark: "#ef6c00",
          },
          info: {
            main: "#2196f3",
            light: "#64b5f6",
            dark: "#0d47a1",
          },
          background: {
            default: "#0e0e10", // Twitch dark background
            paper: "#18181b", // Slightly lighter than background
          },
          text: {
            primary: "#ffffff",
            secondary: "#adadb8",
          },
          divider: "rgba(255, 255, 255, 0.08)",
        }),
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
            boxShadow:
              mode === "light"
                ? "0px 2px 4px rgba(0, 0, 0, 0.1)"
                : "0px 2px 4px rgba(0, 0, 0, 0.3)",
          },
        },
        containedPrimary: {
          background:
            mode === "light"
              ? "linear-gradient(45deg, #5e35b1 30%, #7c4dff 90%)"
              : "linear-gradient(45deg, #7232c9 30%, #9147ff 90%)",
        },
        containedSecondary: {
          background: "linear-gradient(45deg, #00b0ff 30%, #40c4ff 90%)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow:
            mode === "light"
              ? "0px 4px 20px rgba(0, 0, 0, 0.08)"
              : "0px 4px 20px rgba(0, 0, 0, 0.3)",
          overflow: "visible",
          height: "100%",
          display: "flex",
          flexDirection: "column",
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
          flexGrow: 1,
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
          backgroundColor: mode === "light" ? "#280680" : "#0e0e10", // dark purple or Twitch dark
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
          boxShadow:
            mode === "light"
              ? "0px 2px 4px rgba(0, 0, 0, 0.1)"
              : "0px 2px 4px rgba(0, 0, 0, 0.3)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            ...(mode === "dark" && {
              backgroundColor: "rgba(0, 0, 0, 0.15)",
            }),
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
              backgroundColor: mode === "light" ? "#5e35b1" : "#9147ff",
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
          backgroundColor: mode === "light" ? "#757575" : "#555555",
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
    MuiPaper: {
      styleOverrides: {
        root: {
          ...(mode === "dark" && {
            backgroundImage: "none",
          }),
        },
      },
    },
  },
});

// Create context for theme mode
type ThemeContextType = {
  themeMode: "light" | "dark";
  setThemeMode: (mode: "light" | "dark") => void;
  toggleThemeMode: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  themeMode: "light",
  setThemeMode: () => {},
  toggleThemeMode: () => {},
});

interface CustomThemeProviderProps {
  children: React.ReactNode;
}

// Theme Provider with state management
export const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({
  children,
}) => {
  // Get stored theme preference or default to light
  const [themeMode, setThemeMode] = useState<"light" | "dark">(() => {
    const storedTheme = localStorage.getItem("themeMode");
    return storedTheme === "dark" || storedTheme === "light"
      ? storedTheme
      : "light";
  });

  // Update localStorage when theme changes
  useEffect(() => {
    localStorage.setItem("themeMode", themeMode);
  }, [themeMode]);

  // Toggle between light and dark
  const toggleThemeMode = () => {
    setThemeMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  // Create the theme object
  const theme = useMemo(
    () => createTheme(getDesignTokens(themeMode)),
    [themeMode]
  );

  // Context value
  const contextValue = useMemo(
    () => ({
      themeMode,
      setThemeMode,
      toggleThemeMode,
    }),
    [themeMode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};

// Hook to use the theme context
export const useThemeContext = () => useContext(ThemeContext);
