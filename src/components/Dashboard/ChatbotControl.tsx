import React, { useState } from "react";
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
} from "@mui/material";
import BotIcon from "@mui/icons-material/SmartToy";
import PowerIcon from "@mui/icons-material/PowerSettingsNew"; // Changed icon for clarity

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
  const [isConnected, setIsConnected] = useState(initialIsConnected);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnectionToggle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isConnected) {
        await onDisconnect(); // Call disconnect function
        setIsConnected(false); // Update state on success
      } else {
        await onConnect(); // Call connect function
        setIsConnected(true); // Update state on success
      }
    } catch (err) {
      console.error("Error toggling bot connection:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      // Optionally revert state if API call failed definitively
      // setIsConnected(!isConnected); // Revert optimistic update if needed
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: "primary.light" }}>
            <BotIcon />
          </Avatar>
        }
        title="Chatbot Control"
        subheader="Manage your chatbot connection status"
      />
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: isConnected ? "success.main" : "error.main",
              transition: "background-color 0.3s ease", // Smooth transition
            }}
          />
          <Typography variant="body1">
            {" "}
            {/* Slightly larger text */}
            Status:{" "}
            {isLoading
              ? "Processing..."
              : isConnected
              ? "Connected"
              : "Disconnected"}
          </Typography>
        </Box>
        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Error: {error}
          </Typography>
        )}
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
              ? "Disconnecting..."
              : "Connecting..."
            : isConnected
            ? "Disconnect Bot"
            : "Connect Bot"}
        </Button>
      </CardActions>
    </Card>
  );
};
