import React, { useState, useEffect, useCallback } from "react";
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
  CircularProgress,
  Divider,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  ListItemText,
} from "@mui/material";
import GamepadIcon from "@mui/icons-material/SportsEsports";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import SaveIcon from "@mui/icons-material/Save";
import AutoStartIcon from "@mui/icons-material/Autorenew";
import DisableAutoStartIcon from "@mui/icons-material/CancelScheduleSend";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

// Import the new wizard component
import { CreateGameWizard } from "./CreateGameWizard";

// Define a more specific config type for clarity in component state
interface GuessTheNumberConfigState {
  minNumber: number;
  maxNumber: number;
  autoStartEnabled?: boolean;
  autoStartIntervalMinutes?: number | string; // Allow string for empty input
}

// Type for the config object sent/received from the API
interface GameConfigPayload {
  minNumber?: number;
  maxNumber?: number;
  autoStartEnabled?: boolean;
  autoStartIntervalMinutes?: number | null; // Backend uses null for empty interval
}

interface GameManagementProps {
  onStartGame: (gameId: string, options: any) => Promise<void>;
  onStopGame: () => Promise<void>;
  initialGameStatus: {
    isActive: boolean;
    name?: string;
    error?: string;
  } | null;
}

export const GameManagement: React.FC<GameManagementProps> = ({
  onStartGame,
  onStopGame,
  initialGameStatus,
}) => {
  const [selectedGame, setSelectedGame] = useState("guess-the-number");
  const [guessConfig, setGuessConfig] = useState<GuessTheNumberConfigState>({
    minNumber: 1,
    maxNumber: 100,
    autoStartEnabled: false,
    autoStartIntervalMinutes: 15,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatusMessage, setSaveStatusMessage] = useState("");
  const [gameStatus, setGameStatus] = useState(initialGameStatus);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [savedAutoStartEnabled, setSavedAutoStartEnabled] =
    useState<boolean>(false);
  const [isFetchingConfig, setIsFetchingConfig] = useState<boolean>(true);
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false); // State for wizard visibility
  const [aiGeneratedGames, setAiGeneratedGames] = useState<any[]>([]); // Store AI-generated games
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [gameToDelete, setGameToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // --- Utility to convert state interval to payload interval ---
  const getIntervalForPayload = (
    interval: number | string | undefined
  ): number | null => {
    if (interval === "" || typeof interval === "undefined") {
      return null;
    }
    const num = Number(interval);
    return isNaN(num) ? null : num;
  };

  // --- Utility to convert payload interval back to state interval ---
  const getIntervalForState = (
    interval: number | null | undefined
  ): string | number => {
    if (interval === null || typeof interval === "undefined") {
      return ""; // Use empty string for state if null/undefined from backend
    }
    return interval; // Keep as number if it exists
  };

  // --- Fetch AI-Generated Games ---
  const fetchAiGeneratedGames = useCallback(async () => {
    try {
      const response = await fetch("/api/games/definitions", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch game definitions: ${response.statusText}`
        );
      }
      const data = await response.json();
      setAiGeneratedGames(data);
      console.log("Fetched AI-generated games:", data);
    } catch (error) {
      console.error("Error fetching AI-generated games:", error);
    }
  }, []);

  // --- Fetch Config Effect ---
  const fetchGameConfig = useCallback(async () => {
    setIsFetchingConfig(true);
    setSaveStatusMessage("");
    try {
      const response = await fetch(`/api/games/config/${selectedGame}`, {
        credentials: "include",
      });
      if (!response.ok)
        throw new Error(`Failed to fetch config: ${response.statusText}`);
      const data = await response.json();
      if (data && data.config) {
        const fetchedConfig = data.config as GameConfigPayload;
        setGuessConfig({
          minNumber: fetchedConfig.minNumber ?? 1,
          maxNumber: fetchedConfig.maxNumber ?? 100,
          autoStartEnabled: fetchedConfig.autoStartEnabled ?? false,
          autoStartIntervalMinutes: getIntervalForState(
            fetchedConfig.autoStartIntervalMinutes
          ), // Convert for state
        });
        setSavedAutoStartEnabled(fetchedConfig.autoStartEnabled ?? false);
      } else {
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
  }, [selectedGame]);

  useEffect(() => {
    fetchGameConfig();
    fetchAiGeneratedGames();
  }, [fetchGameConfig, fetchAiGeneratedGames]);

  // --- Handle AI Game Created ---
  const handleGameCreated = useCallback((gameDefinition: any) => {
    console.log("New game created:", gameDefinition);
    // Add the new game to the list
    setAiGeneratedGames((prev) => [gameDefinition, ...prev]);
    // Optionally, you could select the new game here
    // setSelectedGame(gameDefinition.id);
  }, []);

  // --- Handle Delete Game ---
  const handleDeleteClick = (game: any) => {
    setGameToDelete({
      id: game.definitionId || game.id,
      name: game.name,
    });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!gameToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/games/definitions/${gameToDelete.id}/delete`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to delete game: ${response.status} ${response.statusText} - ${
            errorData.message || "Unknown error"
          }`
        );
      }

      const result = await response.json();

      if (result.success) {
        // Remove the deleted game from the list
        setAiGeneratedGames((prev) =>
          prev.filter(
            (game) => (game.definitionId || game.id) !== gameToDelete.id
          )
        );

        // If the deleted game was selected, reset to default game
        if (selectedGame === gameToDelete.id) {
          setSelectedGame("guess-the-number");
        }

        setSaveStatusMessage("Game deleted successfully");
      } else {
        setSaveStatusMessage(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error deleting game:", error);
      setSaveStatusMessage(
        error instanceof Error
          ? `Error: ${error.message}`
          : "Failed to delete game."
      );
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setGameToDelete(null);
    }
  };

  // --- Handlers ---

  // NEW: Handler to save only Min/Max numbers
  const handleSaveBaseConfig = async () => {
    setIsSaving(true);
    setSaveStatusMessage("");

    // Only send min/max numbers
    const configToSend: Partial<GameConfigPayload> = {
      // Use Partial<>
      minNumber: guessConfig.minNumber,
      maxNumber: guessConfig.maxNumber,
    };

    const payload = {
      gameId: selectedGame,
      config: selectedGame === "guess-the-number" ? configToSend : {},
    };

    try {
      const response = await fetch("/api/games/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to save base configuration: ${response.status} ${
            response.statusText
          } - ${errorData.message || "Unknown error"}`
        );
      }
      const result = await response.json();
      setSaveStatusMessage(
        result.message || "Base configuration saved successfully!"
      );
      // Re-fetch config to ensure UI consistency, especially if backend modified other fields
      fetchGameConfig();
    } catch (error) {
      setSaveStatusMessage(
        error instanceof Error
          ? `Error: ${error.message}`
          : "Failed to save base game configuration."
      );
      console.error("Error saving base game config:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // NEW: Handler to save ALL settings including enabling Auto-Start
  const handleSaveWithAutoStart = async () => {
    setIsSaving(true);
    setSaveStatusMessage("");

    const currentIntervalForPayload = getIntervalForPayload(
      guessConfig.autoStartIntervalMinutes
    );

    // Send all config, explicitly enabling autoStart
    const configToSend: GameConfigPayload = {
      minNumber: guessConfig.minNumber,
      maxNumber: guessConfig.maxNumber,
      autoStartEnabled: true, // Explicitly true
      autoStartIntervalMinutes: currentIntervalForPayload,
    };

    // Validate interval since autoStart is being enabled
    const interval = configToSend.autoStartIntervalMinutes; // Type is number | null
    // Check for undefined, null, or less than 3
    if (typeof interval === "undefined" || interval === null || interval < 3) {
      setSaveStatusMessage(
        "Error: Auto-start interval must be 3 minutes or more."
      );
      setIsSaving(false);
      return;
    }

    const payload = {
      gameId: selectedGame,
      config: selectedGame === "guess-the-number" ? configToSend : {},
    };

    try {
      const response = await fetch("/api/games/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to save configuration with auto-start: ${response.status} ${
            response.statusText
          } - ${errorData.message || "Unknown error"}`
        );
      }
      const result = await response.json();
      setSaveStatusMessage(
        result.message || "Configuration saved successfully!"
      );
      // Update saved state since we know auto-start was just enabled
      setSavedAutoStartEnabled(true);
    } catch (error) {
      setSaveStatusMessage(
        error instanceof Error
          ? `Error: ${error.message}`
          : "Failed to save game configuration."
      );
      console.error("Error saving game config with auto-start:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisableAutoStart = async () => {
    setIsSaving(true);
    setSaveStatusMessage("");
    console.log("Disabling auto-start for:", selectedGame);

    // Prepare payload with autoStart disabled and null interval
    const configToDisable: GameConfigPayload = {
      minNumber: guessConfig.minNumber,
      maxNumber: guessConfig.maxNumber,
      autoStartEnabled: false,
      autoStartIntervalMinutes: null, // Send null when disabling
    };
    const payload = { gameId: selectedGame, config: configToDisable };

    try {
      const response = await fetch("/api/games/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to disable auto-start: ${response.status} ${
            response.statusText
          } - ${errorData.message || "Unknown error"}`
        );
      }
      const result = await response.json();
      setSaveStatusMessage(
        result.message || "Auto-start disabled successfully!"
      );
      // Update form state to reflect disabled status
      setGuessConfig((prev) => ({
        ...prev,
        autoStartEnabled: false,
        autoStartIntervalMinutes: "", // Set interval to empty string in state
      }));
      setSavedAutoStartEnabled(false);
    } catch (error) {
      setSaveStatusMessage(
        error instanceof Error
          ? `Error: ${error.message}`
          : "Failed to disable auto-start."
      );
      console.error("Error disabling auto-start:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartGame = async () => {
    setIsActionLoading(true);
    setActionError(null);
    try {
      // Only pass min/max when starting manually
      const optionsToSend: Partial<GameConfigPayload> = {
        minNumber: guessConfig.minNumber,
        maxNumber: guessConfig.maxNumber,
      };
      const options = selectedGame === "guess-the-number" ? optionsToSend : {};
      await onStartGame(selectedGame, options);
      setGameStatus({ isActive: true, name: selectedGame });
    } catch (err) {
      console.error("Error starting game:", err);
      setActionError(
        err instanceof Error ? err.message : "Failed to start game"
      );
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
      setGameStatus({ isActive: false });
      // If auto-start was enabled, disable it via save
      if (savedAutoStartEnabled) {
        console.log(
          "Auto-start was enabled, disabling it now after stopping game."
        );
        await handleDisableAutoStart(); // This saves config with autoStart: false
      } else {
        fetchGameConfig(); // Re-fetch config if auto-start wasn't involved
      }
    } catch (err) {
      console.error("Error stopping game:", err);
      setActionError(
        err instanceof Error ? err.message : "Failed to stop game"
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  // --- Render ---
  const isGameActive = gameStatus?.isActive ?? false;
  const disableConfigInputs = isGameActive || isFetchingConfig;
  const disableActions = isActionLoading || isFetchingConfig;

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
        action={
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setIsWizardOpen(true)} // Open the wizard
            sx={{ mr: 1 }}
          >
            New Game
          </Button>
        }
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
                isGameActive || savedAutoStartEnabled
                  ? "success.main"
                  : "grey.500",
              transition: "background-color 0.3s ease",
            }}
          />
          <Typography variant="body1">
            {isActionLoading && !isSaving
              ? "Processing..."
              : isGameActive
              ? `Active: ${gameStatus?.name || "Unknown Game"}`
              : savedAutoStartEnabled
              ? "Auto-start enabled"
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
            // Disable Start if game active OR if SAVED auto-start is enabled (Autostart handles starting)
            disabled={isGameActive || savedAutoStartEnabled || disableActions}
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
            // Disable Stop if game is NOT active OR if SAVED auto-start is enabled (Stop is only for manual games)
            disabled={!isGameActive || savedAutoStartEnabled || disableActions}
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
          <FormControl fullWidth size="small" disabled={disableConfigInputs}>
            <InputLabel id="game-config-select-label">
              Select Game to Configure
            </InputLabel>
            <Select
              labelId="game-config-select-label"
              id="game-config-select"
              value={selectedGame}
              label="Select Game to Configure"
              onChange={(e) => setSelectedGame(e.target.value)}
              disabled={disableConfigInputs}
            >
              <MenuItem value="guess-the-number">Guess the Number</MenuItem>
              {/* Add AI-generated games to the dropdown */}
              {aiGeneratedGames.map((game) => {
                const gameId = game.definitionId || game.id;
                return (
                  <MenuItem
                    key={gameId}
                    value={gameId}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      position: "relative",
                      pr: 6, // Add padding for the delete button
                    }}
                  >
                    <ListItemText primary={`${game.name} (AI-Generated)`} />
                    {/* Only show delete button when dropdown is open and not when selected */}
                    <Box
                      sx={{
                        position: "absolute",
                        right: 8,
                        top: "50%",
                        transform: "translateY(-50%)",
                        // This ensures the button is only visible in the dropdown
                        // and not when the item is selected and shown in the select box
                        display: "inline-flex",
                        ".MuiSelect-select &": { display: "none" },
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent selecting the game when clicking delete
                          e.preventDefault();
                          handleDeleteClick(game);
                        }}
                        sx={{
                          "&:hover": { color: "error.main" },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {selectedGame === "guess-the-number" && (
            <>
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
                    maxNumber: Math.max(newMin + 1, prev.maxNumber),
                  }));
                }}
                fullWidth
                variant="outlined"
                size="small"
                disabled={disableConfigInputs}
              />
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
                disabled={disableConfigInputs}
              />
              {/* --- Button to save only Min/Max --- */}
              <Button
                variant="contained"
                color="secondary" // Standard save color
                startIcon={<SaveIcon />}
                onClick={handleSaveBaseConfig} // Use the new handler
                disabled={isSaving || isGameActive || isFetchingConfig}
                sx={{ mt: 1 }} // Add some margin
              >
                {isSaving ? "Saving..." : "Save Min/Max Config"}
              </Button>
              {/* --- End Button to save only Min/Max --- */}

              <FormControlLabel
                control={
                  <Checkbox
                    id="auto-start-enabled"
                    checked={guessConfig.autoStartEnabled ?? false}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setGuessConfig((prev) => ({
                        ...prev,
                        autoStartEnabled: e.target.checked,
                      }))
                    }
                    size="small"
                    disabled={disableConfigInputs}
                  />
                }
                label="Enable Automatic Game Start"
                sx={{ mt: 1 }}
              />
              {guessConfig.autoStartEnabled && (
                <TextField
                  id="auto-start-interval"
                  label="Start Interval (minutes, 3-1440)"
                  type="number"
                  InputProps={{ inputProps: { min: 3, max: 1440 } }}
                  value={guessConfig.autoStartIntervalMinutes ?? ""}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    if (rawValue === "") {
                      setGuessConfig((prev) => ({
                        ...prev,
                        autoStartIntervalMinutes: "",
                      }));
                    } else {
                      const val = parseInt(rawValue, 10);
                      const clampedVal = isNaN(val)
                        ? 3
                        : Math.max(3, Math.min(1440, val));
                      setGuessConfig((prev) => ({
                        ...prev,
                        autoStartIntervalMinutes: clampedVal,
                      }));
                    }
                  }}
                  fullWidth
                  variant="outlined"
                  size="small"
                  disabled={
                    !guessConfig.autoStartEnabled || disableConfigInputs
                  }
                />
              )}
            </>
          )}

          {/* --- Conditional Save/Action Buttons for Auto-Start --- */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
            {/* "Save Config & Auto-Start Settings" button - Green, visible only when checkbox IS checked */}
            {guessConfig.autoStartEnabled && (
              <Button
                variant="contained"
                color="success" // Keep green
                startIcon={<AutoStartIcon />}
                onClick={handleSaveWithAutoStart} // Use the new handler
                disabled={isSaving || isGameActive || isFetchingConfig}
              >
                {isSaving ? "Saving..." : "Save Config & Auto-Start Settings"}
              </Button>
            )}

            {/* "Disable Auto-Start" button - visible only if saved config has it enabled AND game is inactive */}
            {/* This button remains to explicitly disable a saved auto-start without stopping an active game */}
            {savedAutoStartEnabled && !isGameActive && (
              <Button
                variant="outlined"
                color="warning"
                startIcon={<DisableAutoStartIcon />}
                onClick={handleDisableAutoStart}
                disabled={isSaving || isFetchingConfig}
              >
                {isSaving ? "Saving..." : "Disable Auto-Start"}
              </Button>
            )}
          </Box>
          {/* --- End Conditional Auto-Start Buttons --- */}

          {saveStatusMessage && (
            <Typography
              variant="caption"
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

      {/* Render the Wizard Dialog */}
      <CreateGameWizard
        open={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onGameCreated={handleGameCreated}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => !isDeleting && setIsDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete AI-Generated Game
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the game "{gameToDelete?.name}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={isDeleting}
            startIcon={
              isDeleting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <DeleteIcon />
              )
            }
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};
