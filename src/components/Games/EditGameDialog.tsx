/**
 * @summary Dialog component for editing existing games
 * @author Augment Agent
 * @created 2023-07-15
 */

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Paper,
  IconButton,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";
import { Close as CloseIcon, Save as SaveIcon } from "@mui/icons-material";
import GameApiService from "../../services/gameApi";

interface EditGameDialogProps {
  open: boolean;
  onClose: () => void;
  onGameUpdated: (game: any) => void;
  gameId: string | null;
}

const EditGameDialog: React.FC<EditGameDialogProps> = ({
  open,
  onClose,
  onGameUpdated,
  gameId,
}) => {
  const theme = useTheme();
  const [game, setGame] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [rules, setRules] = useState<string>("");
  const [customSettings, setCustomSettings] = useState<Record<string, any>>({});

  // Fetch game data when dialog opens
  useEffect(() => {
    if (open && gameId) {
      fetchGameData(gameId);
    }
  }, [open, gameId]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setGame(null);
      setName("");
      setDescription("");
      setRules("");
      setCustomSettings({});
      setError(null);
    }
  }, [open]);

  const fetchGameData = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch game definitions and find the specific game
      const games = await GameApiService.getGameDefinitions();
      const gameData = games.find((g) => g.id === id);

      if (!gameData) {
        throw new Error("Game not found");
      }

      setGame(gameData);
      setName(gameData.name);
      setDescription(gameData.description);
      setRules(gameData.enhancedConfig?.rules || "");

      // Initialize settings with the current values
      if (gameData.enhancedConfig?.settings) {
        setCustomSettings(gameData.enhancedConfig.settings);
      }
    } catch (err) {
      console.error("Error fetching game data:", err);
      setError("Failed to load game data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!game) return;

    setIsSaving(true);
    setError(null);

    try {
      // Create updated game object
      const updatedGame = {
        ...game,
        name,
        description,
        enhancedConfig: {
          ...game.enhancedConfig,
          rules,
          settings: customSettings,
        },
      };

      // Call API to update game
      await GameApiService.updateGameDefinition(game.id, updatedGame);

      // Notify parent component
      onGameUpdated(updatedGame);
      onClose();
    } catch (err) {
      console.error("Error saving game:", err);
      setError("Failed to save game. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Render settings editor based on value type
  const renderSettingInput = (key: string, value: any) => {
    // Format the label from camelCase
    const label = key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());

    const valueType = typeof value;

    if (valueType === "boolean") {
      return (
        <FormControlLabel
          control={
            <Switch
              checked={!!customSettings[key]}
              onChange={(e) => {
                setCustomSettings((prev) => ({
                  ...prev,
                  [key]: e.target.checked,
                }));
              }}
            />
          }
          label={label}
        />
      );
    } else if (valueType === "number") {
      return (
        <TextField
          label={label}
          type="number"
          value={customSettings[key]}
          onChange={(e) => {
            const newValue =
              e.target.value === "" ? "" : Number(e.target.value);
            setCustomSettings((prev) => ({
              ...prev,
              [key]: newValue,
            }));
          }}
          fullWidth
          variant="outlined"
          size="small"
          margin="normal"
        />
      );
    } else if (Array.isArray(value)) {
      return (
        <TextField
          label={label}
          value={(customSettings[key] || value).join(", ")}
          onChange={(e) => {
            const newValue = e.target.value
              .split(",")
              .map((item) => item.trim());
            setCustomSettings((prev) => ({
              ...prev,
              [key]: newValue,
            }));
          }}
          fullWidth
          variant="outlined"
          size="small"
          margin="normal"
          helperText="Separate values with commas"
        />
      );
    } else if (valueType === "object" && value !== null) {
      return (
        <TextField
          label={label}
          value={JSON.stringify(customSettings[key] ?? value, null, 2)}
          onChange={(e) => {
            try {
              const parsedValue = JSON.parse(e.target.value);
              setCustomSettings((prev) => ({
                ...prev,
                [key]: parsedValue,
              }));
            } catch (error) {
              // If JSON is invalid, just store as string
              setCustomSettings((prev) => ({
                ...prev,
                [key]: e.target.value,
              }));
            }
          }}
          fullWidth
          variant="outlined"
          size="small"
          margin="normal"
          multiline
          rows={4}
          helperText="Edit as JSON"
        />
      );
    } else {
      return (
        <TextField
          label={label}
          value={customSettings[key]}
          onChange={(e) => {
            setCustomSettings((prev) => ({
              ...prev,
              [key]: e.target.value,
            }));
          }}
          fullWidth
          variant="outlined"
          size="small"
          margin="normal"
        />
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Edit Game</Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : game ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Game Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
            />

            <TextField
              label="Game Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
              multiline
              rows={3}
            />

            {game.enhancedConfig?.rules !== undefined && (
              <TextField
                label="Game Rules"
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                multiline
                rows={4}
              />
            )}

            {game.enhancedConfig?.settings &&
              Object.keys(game.enhancedConfig.settings).length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Game Settings
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    {/* Special handling for autoStart setting if it doesn't exist */}
                    {!("autoStart" in customSettings) && (
                      <Box sx={{ mb: 2 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={!!customSettings.autoStart}
                              onChange={(e) => {
                                setCustomSettings((prev) => ({
                                  ...prev,
                                  autoStart: e.target.checked,
                                }));
                              }}
                            />
                          }
                          label="Auto Start"
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ ml: 2 }}
                        >
                          Automatically start this game when the bot connects
                        </Typography>
                      </Box>
                    )}

                    {/* Render all settings */}
                    {Object.entries(game.enhancedConfig.settings).map(
                      ([key, value]) => (
                        <Box key={key} sx={{ mb: 2 }}>
                          {renderSettingInput(key, value)}
                        </Box>
                      )
                    )}
                  </Paper>
                </Box>
              )}
          </Box>
        ) : (
          <Typography>No game selected</Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          disabled={isLoading || isSaving || !game}
          startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditGameDialog;
