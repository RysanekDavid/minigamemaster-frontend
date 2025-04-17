import React, { useState, useEffect, useCallback } from "react"; // Import useEffect and useCallback
import {
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CardHeader,
  Avatar,
  Box,
  Typography,
  CircularProgress, // For loading state on buttons
  Divider, // To separate sections
  FormControlLabel, // Import FormControlLabel
  Checkbox, // Import Checkbox
} from "@mui/material";
import GamepadIcon from "@mui/icons-material/SportsEsports";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";

// Define a more specific config type for clarity
interface GuessTheNumberConfigState {
  minNumber: number;
  maxNumber: number;
  autoStartEnabled?: boolean;
  autoStartIntervalMinutes?: number | string; // Allow string for empty input
}

interface GameManagementProps {
  // Remove config and onSave props as the component handles its own state and API calls
  // Game control functions
  onStartGame: (gameId: string, options: any) => Promise<void>;
  onStopGame: () => Promise<void>;
  // Initial status
  initialGameStatus: {
    isActive: boolean;
    name?: string;
    error?: string;
  } | null;
}

export const GameManagement: React.FC<GameManagementProps> = ({
  // Remove initialConfig and onSave from destructuring
  onStartGame,
  onStopGame,
  initialGameStatus,
}) => {
  // Config state - manage the full config object for the selected game
  const [selectedGame, setSelectedGame] = useState("guess-the-number"); // Set default directly
  // Use a state object for the specific game's config
  // Initialize state directly, not from props
  const [guessConfig, setGuessConfig] = useState<GuessTheNumberConfigState>({
    minNumber: 1, // Default value
    maxNumber: 100, // Default value
    autoStartEnabled: false, // Default value
    autoStartIntervalMinutes: 15, // Default value
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatusMessage, setSaveStatusMessage] = useState("");

  // Game status and control state
  const [gameStatus, setGameStatus] = useState(initialGameStatus);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [savedAutoStartEnabled, setSavedAutoStartEnabled] =
    useState<boolean>(false); // State for saved auto-start status
  const [isFetchingConfig, setIsFetchingConfig] = useState<boolean>(true); // Loading state for config fetch

  // --- Fetch Config Effect ---
  const fetchGameConfig = useCallback(async () => {
    setIsFetchingConfig(true);
    setSaveStatusMessage(""); // Clear save status on new fetch
    try {
      const response = await fetch(`/api/games/config/${selectedGame}`, {
        credentials: "include", // Include cookies for authentication
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch config: ${response.statusText}`);
      }
      const data = await response.json();
      if (data && data.config) {
        // Update the form state with fetched config
        setGuessConfig({
          minNumber: data.config.minNumber ?? 1,
          maxNumber: data.config.maxNumber ?? 100,
          autoStartEnabled: data.config.autoStartEnabled ?? false,
          autoStartIntervalMinutes: data.config.autoStartIntervalMinutes ?? 15,
        });
        // Update the separate state for the saved auto-start status
        setSavedAutoStartEnabled(data.config.autoStartEnabled ?? false);
      } else {
        // Reset to defaults if no config found or invalid data
        setGuessConfig({
          minNumber: 1,
          maxNumber: 100,
          autoStartEnabled: false,
          autoStartIntervalMinutes: 15,
        });
        setSavedAutoStartEnabled(false);
      }
    } catch (error) {
      console.error("Error fetching game config:", error);
      setSaveStatusMessage(
        error instanceof Error
          ? `Error loading config: ${error.message}`
          : "Error loading config"
      );
      // Reset to defaults on error
      setGuessConfig({
        minNumber: 1,
        maxNumber: 100,
        autoStartEnabled: false,
        autoStartIntervalMinutes: 15,
      });
      setSavedAutoStartEnabled(false);
    } finally {
      setIsFetchingConfig(false);
    }
  }, [selectedGame]); // Re-fetch when selectedGame changes

  useEffect(() => {
    fetchGameConfig();
  }, [fetchGameConfig]); // Run fetchGameConfig on mount and when it changes (due to selectedGame change)

  // --- Handlers ---

  const handleSaveConfig = async () => {
    setIsSaving(true);
    setSaveStatusMessage("");
    console.log("Saving config for:", selectedGame, guessConfig); // Keep console log for debugging

    // Prepare the payload for the backend API
    // Ensure interval is a number or null before sending
    const configToSend = {
      ...guessConfig,
      autoStartIntervalMinutes:
        guessConfig.autoStartIntervalMinutes === "" ||
        guessConfig.autoStartIntervalMinutes === undefined
          ? null // Send null if empty or undefined
          : Number(guessConfig.autoStartIntervalMinutes), // Convert valid string/number to number
    };

    // Validate interval if autoStart is enabled
    if (
      configToSend.autoStartEnabled &&
      (configToSend.autoStartIntervalMinutes === null ||
        configToSend.autoStartIntervalMinutes < 3)
    ) {
      setSaveStatusMessage(
        "Error: Auto-start interval must be 3 minutes or more."
      );
      setIsSaving(false);
      return;
    }

    const payload = {
      gameId: selectedGame,
      config: selectedGame === "guess-the-number" ? configToSend : {}, // Send the processed config
    };

    try {
      // Use fetch API to send the config to the backend
      const response = await fetch("/api/games/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add authentication headers if needed
        },
        body: JSON.stringify(payload), // Send the correct payload structure
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to save configuration: ${response.status} ${
            response.statusText
          } - ${errorData.message || "Unknown error"}`
        );
      }

      const result = await response.json();
      setSaveStatusMessage(
        result.message || "Configuration saved successfully!"
      );
      // After successful save, update the savedAutoStartEnabled state only if it's the relevant game
      if (payload.gameId === "guess-the-number" && payload.config) {
        setSavedAutoStartEnabled(
          (payload.config as GuessTheNumberConfigState).autoStartEnabled ??
            false
        );
      } else {
        // If saving config for a different game, assume auto-start is off for the indicator
        setSavedAutoStartEnabled(false);
      }
    } catch (error) {
      setSaveStatusMessage(
        error instanceof Error
          ? `Error: ${error.message}`
          : "Failed to save game configuration."
      );
      console.error("Error saving game config:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartGame = async () => {
    setIsActionLoading(true);
    setActionError(null);
    try {
      // Pass the current config state as options when starting
      const options = selectedGame === "guess-the-number" ? guessConfig : {};
      await onStartGame(selectedGame, options);
      // Optimistically update status or re-fetch (simple update for now)
      setGameStatus({ isActive: true, name: selectedGame });
    } catch (err) {
      console.error("Error starting game:", err);
      setActionError(
        err instanceof Error ? err.message : "Failed to start game"
      );
      // Ensure status reflects failure if possible
      setGameStatus({ isActive: false });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleStopGame = async () => {
    setIsActionLoading(true);
    setActionError(null);
    try {
      await onStopGame();
      // Optimistically update status or re-fetch (simple update for now)
      setGameStatus({ isActive: false });
    } catch (err) {
      console.error("Error stopping game:", err);
      setActionError(
        err instanceof Error ? err.message : "Failed to stop game"
      );
      // Status might still be active if stop failed, ideally re-fetch
    } finally {
      setIsActionLoading(false);
    }
  };

  // --- Render ---
  const isGameActive = gameStatus?.isActive ?? false;

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: "primary.light" }}>
            <GamepadIcon />
          </Avatar>
        }
        title="Game Management"
        subheader="Start, stop, and configure mini-games"
      />
      {/* Game Status and Controls Section */}
      <CardContent sx={{ flexGrow: 0 }}>
        <Typography variant="h6" gutterBottom>
          Game Status
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor:
                isGameActive || savedAutoStartEnabled // Green if active OR auto-start is on
                  ? "success.main"
                  : "grey.500", // Grey only if inactive AND auto-start is off
              transition: "background-color 0.3s ease",
            }}
          />
          <Typography variant="body1">
            {isActionLoading
              ? "Processing..."
              : isGameActive
              ? `Active: ${gameStatus?.name || "Unknown Game"}`
              : savedAutoStartEnabled // Check saved state when inactive
              ? "Auto-start enabled" // Indicate auto-start is waiting
              : "No game active"}
          </Typography>
        </Box>
        {actionError && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            Error: {actionError}
          </Typography>
        )}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={
              isActionLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <PlayArrowIcon />
              )
            }
            onClick={handleStartGame}
            disabled={isGameActive || isActionLoading}
            sx={{ flexGrow: 1 }}
          >
            Start Game
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={
              isActionLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <StopIcon />
              )
            }
            onClick={handleStopGame}
            disabled={!isGameActive || isActionLoading}
            sx={{ flexGrow: 1 }}
          >
            Stop Game
          </Button>
        </Box>
      </CardContent>

      <Divider sx={{ my: 1 }} />

      {/* Game Configuration Section */}
      <CardContent sx={{ flexGrow: 1, overflowY: "auto" }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Game Configuration
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="game-config-select-label">
              Select Game to Configure
            </InputLabel>
            <Select
              labelId="game-config-select-label"
              id="game-config-select"
              value={selectedGame}
              label="Select Game to Configure"
              onChange={(e) => {
                setSelectedGame(e.target.value);
                // Reset specific config when changing game if needed
              }}
              disabled={isGameActive} // Disable config while game is active? Or allow? For now, disable.
            >
              <MenuItem value="guess-the-number">Guess the Number</MenuItem>
              {/* Add other games here */}
            </Select>
          </FormControl>

          {/* --- Config fields for Guess the Number --- */}
          {selectedGame === "guess-the-number" && !isGameActive && (
            <>
              {/* Min Number */}
              <TextField
                id="config-min-number"
                label="Min Number (1-999)"
                type="number"
                InputProps={{ inputProps: { min: 1, max: 999 } }}
                value={guessConfig.minNumber}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  const newMin = isNaN(val)
                    ? 1
                    : Math.max(1, Math.min(999, val));
                  setGuessConfig((prev) => ({
                    ...prev,
                    minNumber: newMin,
                    maxNumber: Math.max(newMin + 1, prev.maxNumber), // Adjust max if needed
                  }));
                }}
                fullWidth
                variant="outlined"
                size="small"
              />
              {/* Max Number */}
              <TextField
                id="config-max-number"
                label={`Max Number (${guessConfig.minNumber + 1}-1000)`}
                type="number"
                InputProps={{
                  inputProps: { min: guessConfig.minNumber + 1, max: 1000 },
                }}
                value={guessConfig.maxNumber}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  const newMax = isNaN(val)
                    ? guessConfig.minNumber + 1
                    : Math.max(guessConfig.minNumber + 1, Math.min(1000, val));
                  setGuessConfig((prev) => ({ ...prev, maxNumber: newMax }));
                }}
                fullWidth
                variant="outlined"
                size="small"
              />
              {/* Auto-Start Checkbox */}
              <FormControlLabel
                control={
                  <Checkbox
                    id="auto-start-enabled"
                    checked={guessConfig.autoStartEnabled ?? false}
                    onChange={(
                      e: React.ChangeEvent<HTMLInputElement> // Explicitly type 'e'
                    ) =>
                      setGuessConfig((prev) => ({
                        ...prev,
                        autoStartEnabled: e.target.checked,
                      }))
                    }
                    size="small"
                  />
                }
                label="Enable Automatic Game Start"
                sx={{ mt: 1 }} // Add some margin
              />
              {/* Auto-Start Interval (Conditional) */}
              {guessConfig.autoStartEnabled && (
                <TextField
                  id="auto-start-interval"
                  label="Start Interval (minutes, 3-1440)" // Update label
                  type="number"
                  InputProps={{ inputProps: { min: 3, max: 1440 } }} // Update min prop
                  // Use empty string for value if undefined/null to allow deletion
                  value={guessConfig.autoStartIntervalMinutes ?? ""}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    // Allow empty input temporarily
                    if (rawValue === "") {
                      setGuessConfig((prev) => ({
                        ...prev,
                        autoStartIntervalMinutes: "", // Set to empty string
                      }));
                    } else {
                      const val = parseInt(rawValue, 10);
                      // Validate and clamp the number, default to 3 if invalid
                      const clampedVal = isNaN(val)
                        ? 3
                        : Math.max(3, Math.min(1440, val)); // Use 3 as min
                      setGuessConfig((prev) => ({
                        ...prev,
                        autoStartIntervalMinutes: clampedVal,
                      }));
                    }
                  }}
                  fullWidth
                  variant="outlined"
                  size="small"
                  disabled={!guessConfig.autoStartEnabled}
                />
              )}
            </>
          )}
          {/* --- End Guess the Number Config --- */}

          {/* Add config sections for other games here */}

          {/* Save Config Button */}
          <Button
            variant="contained"
            color="secondary" // Different color for config save
            onClick={handleSaveConfig}
            disabled={isSaving || isGameActive} // Disable if saving or game active
            sx={{ mt: 1 }} // Add some margin
          >
            {isSaving ? "Saving Config..." : "Save Config"}
          </Button>
          {saveStatusMessage && (
            <Typography
              variant="caption" // Smaller text for status
              color={
                saveStatusMessage.startsWith("Error") ? "error" : "success.main"
              }
              sx={{ textAlign: "center", mt: 1 }}
            >
              {saveStatusMessage}
            </Typography>
          )}
        </Box>
      </CardContent>
      {/* Removed separate CardActions for config save */}
    </Card>
  );
};
