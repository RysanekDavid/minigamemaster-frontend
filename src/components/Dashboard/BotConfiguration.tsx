import React, { useState, useEffect } from "react"; // Import useEffect
import { useTranslation } from "react-i18next"; // Import translation hook
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  CardHeader,
  Avatar,
  Box,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";

// Remove placeholder props interface
// interface BotConfigurationProps { ... }

export const BotConfiguration: React.FC = () => {
  // Remove props
  const { t } = useTranslation(); // Initialize translation hook
  const [commandPrefix, setCommandPrefix] = useState("!"); // Default to '!' initially
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true); // State for initial fetch
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Separate error message state

  // Fetch current prefix on mount
  useEffect(() => {
    const fetchPrefix = async () => {
      setIsFetching(true);
      setErrorMessage("");
      try {
        const response = await fetch("/api/bot-config/settings", {
          // Corrected path
          credentials: "include",
        }); // Use GET endpoint, include credentials
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCommandPrefix(data.prefix || "!"); // Set fetched prefix or default
      } catch (error) {
        console.error("Error fetching command prefix:", error);
        setErrorMessage(t("botConfig.loadError"));
      } finally {
        setIsFetching(false);
      }
    };

    fetchPrefix();
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleSave = async () => {
    setIsLoading(true);
    setStatusMessage("");
    setErrorMessage("");
    try {
      const response = await fetch("/api/bot-config/settings", {
        // Corrected path
        // Use PUT endpoint, include credentials
        method: "PUT",
        credentials: "include", // Add credentials here
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prefix: commandPrefix }), // Send new prefix in body
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error occurred" })); // Try to parse error
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      setStatusMessage(t("botConfig.configSaved"));
    } catch (error: any) {
      // Catch any type for error message
      setStatusMessage(""); // Clear success message
      setErrorMessage(`${t("botConfig.configSaveError")} ${error.message}`);
      console.error("Error saving bot config:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: "primary.light" }}>
            <SettingsIcon />
          </Avatar>
        }
        title={t("botConfig.title")}
        subheader={t("botConfig.subtitle")}
      />
      <CardContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <TextField
            id="command-prefix"
            label={t("botConfig.commandPrefix")}
            value={commandPrefix}
            onChange={(e) => setCommandPrefix(e.target.value)}
            inputProps={{ maxLength: 3 }}
            fullWidth
            variant="outlined"
            size="small"
            disabled={isFetching || isLoading} // Disable while fetching or saving
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t("botConfig.commandPrefixDescription")}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t("botConfig.commandPrefixExample")}
          </Typography>
        </Box>
      </CardContent>
      <CardActions sx={{ p: 2 }}>
        {" "}
        {/* Added padding */}
        <Button
          variant="contained"
          fullWidth
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading
            ? t("common.saving")
            : isFetching
            ? t("common.loading")
            : t("botConfig.saveConfig")}
        </Button>
      </CardActions>
      {(statusMessage || errorMessage) && (
        <Box sx={{ p: 2, pt: 0 }}>
          <Typography
            variant="body2"
            color={errorMessage ? "error" : "success.main"} // Show error color if error exists
          >
            {errorMessage || statusMessage}{" "}
            {/* Show error or success message */}
          </Typography>
        </Box>
      )}
    </Card>
  );
};
