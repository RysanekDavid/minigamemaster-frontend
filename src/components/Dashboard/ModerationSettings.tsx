import React, { useState } from "react";
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
  FormControlLabel,
  Switch,
} from "@mui/material";
import ShieldIcon from "@mui/icons-material/Shield";

interface ModerationSettingsProps {
  // Placeholder props - adjust when API is ready
  settings: {
    enableBasicModeration: boolean;
    bannedWords: string; // Keep as comma-separated string for textarea
  };
  // Make async for potential API call
  onSave: (settings: {
    enableBasicModeration: boolean;
    bannedWords: string;
  }) => Promise<void>;
}

export const ModerationSettings: React.FC<ModerationSettingsProps> = ({
  settings,
  onSave,
}) => {
  const [enableBasicModeration, setEnableBasicModeration] = useState(
    settings.enableBasicModeration
  );
  const [bannedWords, setBannedWords] = useState(settings.bannedWords);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleSave = async () => {
    setIsLoading(true);
    setStatusMessage("");
    try {
      await onSave({ enableBasicModeration, bannedWords });
      setStatusMessage("Moderation settings saved successfully!");
    } catch (error) {
      // Display the specific error message from the thrown error
      setStatusMessage(
        error instanceof Error
          ? `Error: ${error.message}`
          : "Failed to save moderation settings."
      );
      console.error("Error saving moderation settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: "primary.light" }}>
            <ShieldIcon />
          </Avatar>
        }
        title="Moderation Settings"
        subheader="Configure chat moderation settings"
      />
      <CardContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={enableBasicModeration}
                onChange={(e) => setEnableBasicModeration(e.target.checked)}
              />
            }
            label={
              <Box>
                <Typography variant="body2">Enable Basic Moderation</Typography>
                <Typography variant="caption" color="text.secondary">
                  Filter out banned words from chat (Placeholder)
                </Typography>
              </Box>
            }
          />

          <TextField
            id="banned-words"
            label="Banned Words (comma-separated)"
            value={bannedWords}
            onChange={(e) => setBannedWords(e.target.value)}
            disabled={!enableBasicModeration}
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            size="small"
          />
        </Box>
      </CardContent>
      <CardActions sx={{ p: 2 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Moderation Settings"}
        </Button>
      </CardActions>
      {statusMessage && (
        <Box sx={{ p: 2, pt: 0 }}>
          <Typography
            variant="body2"
            color={
              statusMessage.startsWith("Failed") ? "error" : "success.main"
            }
          >
            {statusMessage}
          </Typography>
        </Box>
      )}
    </Card>
  );
};
