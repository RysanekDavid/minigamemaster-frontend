import React, { useState, useEffect } from "react"; // Import useEffect
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
        setErrorMessage("Failed to load current command prefix.");
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

      setStatusMessage("Bot configuration saved successfully!");
    } catch (error: any) {
      // Catch any type for error message
      setStatusMessage(""); // Clear success message
      setErrorMessage(`Failed to save bot configuration: ${error.message}`);
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
        title="Bot Configuration"
        subheader="Configure your bot's behavior"
      />
      <CardContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <TextField
            id="command-prefix"
            label="Command Prefix"
            value={commandPrefix}
            onChange={(e) => setCommandPrefix(e.target.value)}
            inputProps={{ maxLength: 3 }}
            fullWidth
            variant="outlined"
            size="small"
            disabled={isFetching || isLoading} // Disable while fetching or saving
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This is the character (or characters, max 3) that viewers in your
            Twitch chat must type before a command name for the bot to recognize
            it.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Example: If the prefix is '!', viewers would type '!guess 10' or
            '!startgame'.
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
            ? "Saving..."
            : isFetching
            ? "Loading..."
            : "Save Bot Config"}
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
