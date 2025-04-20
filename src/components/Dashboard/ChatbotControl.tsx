import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  CardHeader,
  Avatar,
  CircularProgress, // Import CircularProgress for loading state
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import BotIcon from "@mui/icons-material/SmartToy";
import PowerIcon from "@mui/icons-material/PowerSettingsNew"; // Changed icon for clarity
import { useTranslation } from "react-i18next"; // Import translation hook

interface ChatbotControlProps {
  initialIsConnected: boolean; // Start with initial state
  // Functions to trigger API calls
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
}

export const ChatbotControl: React.FC<ChatbotControlProps> = ({
  initialIsConnected,
  onConnect,
  onDisconnect,
}) => {
  const { t } = useTranslation(); // Initialize translation hook
  const [isConnected, setIsConnected] = useState(initialIsConnected);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoConnect, setAutoConnect] = useState(() => {
    // Load from localStorage with default of true
    const saved = localStorage.getItem("autoConnectBot");
    return saved !== null ? saved === "true" : true;
  });

  // Save autoConnect preference when it changes
  useEffect(() => {
    localStorage.setItem("autoConnectBot", autoConnect.toString());
  }, [autoConnect]);

  // Auto-connect on initial load if enabled
  useEffect(() => {
    // Only try to connect if not already connected and autoConnect is enabled
    if (!initialIsConnected && autoConnect) {
      // Use a small delay to avoid immediate connection on page load
      const timer = setTimeout(() => {
        handleConnectionToggle(true); // Connect without toggling
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [initialIsConnected]); // Only run on initial load

  const handleConnectionToggle = async (forceConnect = false) => {
    setIsLoading(true);
    setError(null);
    try {
      // If forceConnect is true, we always connect regardless of current state
      if (isConnected && !forceConnect) {
        await onDisconnect(); // Call disconnect function
        setIsConnected(false); // Update state on success
      } else if (!isConnected || forceConnect) {
        await onConnect(); // Call connect function
        setIsConnected(true); // Update state on success
      }
    } catch (err) {
      console.error("Error toggling bot connection:", err);
      setError(err instanceof Error ? err.message : t("common.unknownError"));
      // Optionally revert state if API call failed definitively
      // setIsConnected(!isConnected); // Revert optimistic update if needed
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoConnectChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAutoConnect(event.target.checked);
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: "primary.light" }}>
            <BotIcon />
          </Avatar>
        }
        title={t("chatbot.title")}
        subheader={t("chatbot.subtitle")}
      />
      <CardContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Status indicator */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: 1.5,
              bgcolor: "background.paper",
              borderRadius: 1,
              border: 1,
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: isConnected ? "success.main" : "error.main",
                transition: "background-color 0.3s ease", // Smooth transition
                boxShadow: "0 0 4px rgba(0,0,0,0.2)",
              }}
            />
            <Typography variant="body1" fontWeight="medium">
              {t("common.status")}:{" "}
              <Box
                component="span"
                sx={{
                  color: isConnected
                    ? "success.main"
                    : isLoading
                    ? "info.main"
                    : "error.main",
                  fontWeight: "bold",
                }}
              >
                {isLoading
                  ? t("common.processing")
                  : isConnected
                  ? t("common.connected")
                  : t("common.disconnected")}
              </Box>
            </Typography>
          </Box>

          {/* Auto-connect option */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              p: 1.5,
              bgcolor: "background.paper",
              borderRadius: 1,
              border: 1,
              borderColor: "divider",
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={autoConnect}
                  onChange={handleAutoConnectChange}
                  size="small"
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" fontWeight="medium">
                  {t("chatbot.autoConnect")}
                </Typography>
              }
              sx={{ m: 0 }}
            />
          </Box>

          {/* Error message */}
          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {t("chatbot.connectionError")} {error}
            </Typography>
          )}
        </Box>
      </CardContent>
      <CardActions sx={{ p: 2 }}>
        <Button
          variant="contained"
          color={isConnected ? "error" : "primary"}
          fullWidth
          startIcon={
            isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <PowerIcon />
            )
          }
          onClick={handleConnectionToggle}
          disabled={isLoading}
        >
          {isLoading
            ? isConnected
              ? t("common.disconnecting")
              : t("common.connecting")
            : isConnected
            ? t("common.disconnectBot")
            : t("common.connectBot")}
        </Button>
      </CardActions>
    </Card>
  );
};
