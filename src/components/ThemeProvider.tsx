import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import {
  ThemeProvider as MUIThemeProvider,
  createTheme,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { purple } from "@mui/material/colors";
import useMediaQuery from "@mui/material/useMediaQuery";

type ThemeMode = "dark" | "light" | "system";

// Define the shape of the context state
interface ThemeContextProps {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void; // Helper to easily switch between light/dark
}

// Create the context with a default value
const ThemeContext = createContext<ThemeContextProps>({
  themeMode: "system",
  setThemeMode: () => console.warn("setThemeMode function not ready"),
  toggleThemeMode: () => console.warn("toggleThemeMode function not ready"),
});

export const useThemeContext = () => useContext(ThemeContext);

interface CustomThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
}

export const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({
  children,
  defaultTheme = "system",
}) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    // Initialize state from localStorage or default
    if (typeof window !== "undefined") {
      return (localStorage.getItem("themeMode") as ThemeMode) || defaultTheme;
    }
    return defaultTheme;
  });
  const [mounted, setMounted] = useState(false);
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  useEffect(() => {
    setMounted(true);
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    const systemTheme = prefersDarkMode ? "dark" : "light";
    const currentMode = themeMode === "system" ? systemTheme : themeMode;
    root.classList.add(currentMode);
  }, [themeMode, prefersDarkMode]);

  const handleSetThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("themeMode", mode);
    }
  };

  const toggleThemeMode = () => {
    const systemTheme = prefersDarkMode ? "dark" : "light";
    const currentMode = themeMode === "system" ? systemTheme : themeMode;
    handleSetThemeMode(currentMode === "dark" ? "light" : "dark");
  };

  // Determine the actual MUI mode ('light' or 'dark')
  const muiMode = useMemo(() => {
    if (themeMode === "system") {
      return prefersDarkMode ? "dark" : "light";
    }
    return themeMode;
  }, [themeMode, prefersDarkMode]);

  // Create the MUI theme based on the mode
  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: muiMode,
          primary: {
            // Using purple similar to the template's primary color
            main: purple[500],
            light: purple[300], // Added for avatar backgrounds etc.
            contrastText: "#fff", // Ensure text is readable on primary
          },
          secondary: {
            main: "#f50057", // Example secondary
          },
          background: {
            default: muiMode === "dark" ? "#121212" : "#f5f5f5", // Darker/Lighter backgrounds
            paper: muiMode === "dark" ? "#1e1e1e" : "#ffffff",
          },
        },
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        },
        components: {
          // Example: Style AppBar to match template's primary color
          MuiAppBar: {
            styleOverrides: {
              root: ({ theme }) => ({
                backgroundColor: theme.palette.primary.main, // Use theme's primary
                color: theme.palette.primary.contrastText, // Ensure contrast
              }),
            },
          },
          // Add Card override for border radius
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: "12px", // Increased border radius
              },
            },
          },
          // Add other component overrides if needed
        },
      }),
    [muiMode]
  );

  // Prevent rendering until mounted to avoid hydration issues
  if (!mounted) {
    return null; // Or a loading spinner/placeholder
  }

  return (
    <ThemeContext.Provider
      value={{ themeMode, setThemeMode: handleSetThemeMode, toggleThemeMode }}
    >
      <MUIThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};
