import React, { useState } from "react";
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
} from "@mui/material";
import GamepadIcon from "@mui/icons-material/SportsEsports";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";

interface GameManagementProps {
  // Placeholder props - adjust when API is ready
  config: {
    selectedGame: string; // e.g., 'guess-the-number'
    maxNumber: number; // Specific to guess-the-number
    // Add other game configs later, maybe using a union type or generics
  };
  // Config save function
  onSave: (config: {
    selectedGame: string;
    maxNumber: number; // Specific to guess-the-number
  }) => Promise<void>;
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
  config,
  onSave,
  onStartGame,
  onStopGame,
  initialGameStatus,
}) => {
  // Config state
  const [selectedGame, setSelectedGame] = useState(
    config.selectedGame || "guess-the-number"
  );
  const [maxNumber, setMaxNumber] = useState(config.maxNumber || 100);
  const [isSaving, setIsSaving] = useState(false); // Renamed from isLoading
  const [saveStatusMessage, setSaveStatusMessage] = useState(""); // Renamed

  // Game status and control state
  const [gameStatus, setGameStatus] = useState(initialGameStatus);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // --- Handlers ---

  const handleSaveConfig = async () => {
    setIsSaving(true);
    setSaveStatusMessage("");
    try {
      // Pass only relevant config for the selected game
      await onSave({ selectedGame, maxNumber });
      setSaveStatusMessage("Game configuration saved successfully!");
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
      // Pass options based on selected game and config state
      const options = selectedGame === "guess-the-number" ? { maxNumber } : {};
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
              bgcolor: isGameActive ? "success.main" : "grey.500",
              transition: "background-color 0.3s ease",
            }}
          />
          <Typography variant="body1">
            {isActionLoading
              ? "Processing..."
              : isGameActive
              ? `Active: ${gameStatus?.name || "Unknown Game"}`
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

          {/* Show config fields based on selectedGame */}
          {selectedGame === "guess-the-number" &&
            !isGameActive && ( // Only show if correct game selected AND inactive
              <TextField
                id="config-max-number"
                label="Max Number (10-1000)"
                type="number"
                InputProps={{ inputProps: { min: 10, max: 1000 } }}
                value={maxNumber}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  // Basic validation
                  setMaxNumber(
                    isNaN(val) ? 10 : Math.max(10, Math.min(1000, val))
                  );
                }}
                fullWidth
                variant="outlined"
                size="small"
                disabled={isGameActive} // Disable config field too
              />
            )}
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
