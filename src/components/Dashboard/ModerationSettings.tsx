import React, { useState } from "react";
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
  const { t } = useTranslation(); // Initialize translation hook
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
      setStatusMessage(t("moderation.saveSuccess"));
    } catch (error) {
      // Display the specific error message from the thrown error
      setStatusMessage(
        error instanceof Error
          ? `Error: ${error.message}`
          : t("moderation.saveError")
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
        title={t("moderation.title")}
        subheader={t("moderation.subtitle")}
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
                <Typography variant="body2">
                  {t("moderation.enableBasicModeration")}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t("moderation.filterDescription")}
                </Typography>
              </Box>
            }
          />

          <TextField
            id="banned-words"
            label={t("moderation.bannedWords")}
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
          {isLoading ? t("common.saving") : t("moderation.saveSettings")}
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
