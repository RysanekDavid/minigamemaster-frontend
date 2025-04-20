import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next"; // Import translation hook
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
  randomizeGamesOnAutoStart?: boolean; // New option to randomize game selection
}

// Type for AI game configuration state
interface AiGameConfigState {
  // Common auto-start settings
  autoStartEnabled?: boolean;
  autoStartIntervalMinutes?: number | string;
  randomizeGamesOnAutoStart?: boolean; // New option to randomize game selection

  // Guess game specific
  minNumber?: number;
  maxNumber?: number;
  maxGuesses?: number;
  hintFrequency?: number;

  // Trivia game specific
  timePerQuestion?: number;
  pointsPerQuestion?: number;
  allowPartialMatches?: boolean;

  // Word game specific
  minWordLength?: number;
  maxWordLength?: number;
  timeLimit?: number;
  allowPluralForms?: boolean;

  // Story game specific
  maxContributionLength?: number;
  turnTimeLimit?: number;
}

// Type for the config object sent/received from the API
interface GameConfigPayload {
  // Common settings
  autoStartEnabled?: boolean;
  autoStartIntervalMinutes?: number | null; // Backend uses null for empty interval
  randomizeGamesOnAutoStart?: boolean; // New option to randomize game selection on auto-start

  // Game-specific settings
  minNumber?: number;
  maxNumber?: number;
  maxGuesses?: number;
  hintFrequency?: number;
  timePerQuestion?: number;
  pointsPerQuestion?: number;
  allowPartialMatches?: boolean;
  minWordLength?: number;
  maxWordLength?: number;
  timeLimit?: number;
  allowPluralForms?: boolean;
  maxContributionLength?: number;
  turnTimeLimit?: number;
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
  const { t } = useTranslation(); // Initialize translation hook
  const [selectedGame, setSelectedGame] = useState("guess-the-number");
  const [guessConfig, setGuessConfig] = useState<GuessTheNumberConfigState>({
    minNumber: 1,
    maxNumber: 100,
    autoStartEnabled: false,
    autoStartIntervalMinutes: 15,
    randomizeGamesOnAutoStart: false,
  });

  const [aiGameConfig, setAiGameConfig] = useState<AiGameConfigState>({
    autoStartEnabled: false,
    autoStartIntervalMinutes: 15,
    randomizeGamesOnAutoStart: false,
  });

  const [selectedGameType, setSelectedGameType] =
    useState<string>("guess-the-number");

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
  const [isLoadingGames, setIsLoadingGames] = useState(false);

  const fetchAiGeneratedGames = useCallback(async () => {
    // Prevent duplicate calls while loading
    if (isLoadingGames) return;

    setIsLoadingGames(true);
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
    } finally {
      setIsLoadingGames(false);
    }
  }, [isLoadingGames]); // Only depend on the loading state

  // --- Fetch Config Effect ---
  const fetchGameConfig = useCallback(async () => {
    setIsFetchingConfig(true);
    setSaveStatusMessage("");
    try {
      // First, determine if this is an AI-generated game
      const isAiGame = selectedGame !== "guess-the-number";

      // Find the game definition if it's an AI game
      let gameType = "guess-the-number";
      if (isAiGame) {
        const selectedAiGame = aiGeneratedGames.find(
          (game) => (game.definitionId || game.id) === selectedGame
        );
        if (selectedAiGame) {
          gameType =
            selectedAiGame.templateType ||
            selectedAiGame.enhancedConfig?.gameType ||
            "generic";
        }
      }

      // Update the selected game type
      setSelectedGameType(gameType);

      // Fetch the configuration
      const response = await fetch(`/api/games/config/${selectedGame}`, {
        credentials: "include",
      });
      if (!response.ok)
        throw new Error(`Failed to fetch config: ${response.statusText}`);
      const data = await response.json();

      if (data && data.config) {
        const fetchedConfig = data.config as GameConfigPayload;

        // Set auto-start status for all game types
        setSavedAutoStartEnabled(fetchedConfig.autoStartEnabled ?? false);

        if (selectedGame === "guess-the-number") {
          // Handle hardcoded game config
          setGuessConfig({
            minNumber: fetchedConfig.minNumber ?? 1,
            maxNumber: fetchedConfig.maxNumber ?? 100,
            autoStartEnabled: fetchedConfig.autoStartEnabled ?? false,
            autoStartIntervalMinutes: getIntervalForState(
              fetchedConfig.autoStartIntervalMinutes
            ),
            randomizeGamesOnAutoStart:
              fetchedConfig.randomizeGamesOnAutoStart ?? false,
          });
        } else {
          // Handle AI-generated game config
          setAiGameConfig({
            // Common settings
            autoStartEnabled: fetchedConfig.autoStartEnabled ?? false,
            autoStartIntervalMinutes: getIntervalForState(
              fetchedConfig.autoStartIntervalMinutes
            ),
            randomizeGamesOnAutoStart:
              fetchedConfig.randomizeGamesOnAutoStart ?? false,

            // Game-specific settings based on game type
            ...(gameType === "guess" || gameType === "guess-the-number"
              ? {
                  minNumber: fetchedConfig.minNumber ?? 1,
                  maxNumber: fetchedConfig.maxNumber ?? 100,
                  maxGuesses: fetchedConfig.maxGuesses ?? 0,
                  hintFrequency: fetchedConfig.hintFrequency ?? 5,
                }
              : {}),

            ...(gameType === "trivia"
              ? {
                  timePerQuestion: fetchedConfig.timePerQuestion ?? 30,
                  pointsPerQuestion: fetchedConfig.pointsPerQuestion ?? 10,
                  allowPartialMatches:
                    fetchedConfig.allowPartialMatches ?? true,
                }
              : {}),

            ...(gameType === "word"
              ? {
                  minWordLength: fetchedConfig.minWordLength ?? 3,
                  maxWordLength: fetchedConfig.maxWordLength ?? 10,
                  timeLimit: fetchedConfig.timeLimit ?? 60,
                  allowPluralForms: fetchedConfig.allowPluralForms ?? true,
                }
              : {}),

            ...(gameType === "story"
              ? {
                  maxContributionLength:
                    fetchedConfig.maxContributionLength ?? 100,
                  turnTimeLimit: fetchedConfig.turnTimeLimit ?? 60,
                }
              : {}),
          });
        }
      } else {
        // Set defaults if no config found
        if (selectedGame === "guess-the-number") {
          setGuessConfig({
            minNumber: 1,
            maxNumber: 100,
            autoStartEnabled: false,
            autoStartIntervalMinutes: 15,
            randomizeGamesOnAutoStart: false,
          });
        } else {
          setAiGameConfig({
            autoStartEnabled: false,
            autoStartIntervalMinutes: 15,
            randomizeGamesOnAutoStart: false,

            // Set defaults based on game type
            ...(gameType === "guess"
              ? {
                  minNumber: 1,
                  maxNumber: 100,
                  maxGuesses: 0,
                  hintFrequency: 5,
                }
              : {}),

            ...(gameType === "trivia"
              ? {
                  timePerQuestion: 30,
                  pointsPerQuestion: 10,
                  allowPartialMatches: true,
                }
              : {}),

            ...(gameType === "word"
              ? {
                  minWordLength: 3,
                  maxWordLength: 10,
                  timeLimit: 60,
                  allowPluralForms: true,
                }
              : {}),

            ...(gameType === "story"
              ? {
                  maxContributionLength: 100,
                  turnTimeLimit: 60,
                }
              : {}),
          });
        }
        setSavedAutoStartEnabled(false);
      }
    } catch (error) {
      console.error("Error fetching game config:", error);
      setSaveStatusMessage(
        error instanceof Error
          ? `Error loading config: ${error.message}`
          : "Error loading config"
      );

      // Set defaults on error
      if (selectedGame === "guess-the-number") {
        setGuessConfig({
          minNumber: 1,
          maxNumber: 100,
          autoStartEnabled: false,
          autoStartIntervalMinutes: 15,
          randomizeGamesOnAutoStart: false,
        });
      } else {
        setAiGameConfig({
          autoStartEnabled: false,
          autoStartIntervalMinutes: 15,
          randomizeGamesOnAutoStart: false,
        });
      }
      setSavedAutoStartEnabled(false);
    } finally {
      setIsFetchingConfig(false);
    }
  }, [selectedGame, aiGeneratedGames]);

  // Initial data loading effect
  useEffect(() => {
    // Fetch AI-generated games first
    fetchAiGeneratedGames();
    // We'll fetch the game config in a separate effect
  }, []); // Empty dependency array means this runs once on mount

  // Effect to fetch game config when selected game changes or after AI games are loaded
  useEffect(() => {
    if (selectedGame) {
      fetchGameConfig();
    }
  }, [selectedGame, fetchGameConfig]);

  // --- Handle AI Game Created ---
  const handleGameCreated = useCallback((gameDefinition: any) => {
    console.log("New game created:", gameDefinition);
    // Add the new game to the list without triggering a full reload
    setAiGeneratedGames((prev) => {
      // Check if the game already exists in the list
      const gameId = gameDefinition.definitionId || gameDefinition.id;
      const exists = prev.some(
        (game) => (game.definitionId || game.id) === gameId
      );

      // Only add if it doesn't exist
      return exists ? prev : [gameDefinition, ...prev];
    });

    // Optionally, select the new game
    // setSelectedGame(gameDefinition.definitionId || gameDefinition.id);
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

  // Handler to save basic game configuration
  const handleSaveBaseConfig = async () => {
    setIsSaving(true);
    setSaveStatusMessage("");

    // Prepare config based on game type
    let configToSend: Partial<GameConfigPayload> = {};

    if (selectedGame === "guess-the-number") {
      // For hardcoded Guess the Number game
      configToSend = {
        minNumber: guessConfig.minNumber,
        maxNumber: guessConfig.maxNumber,
      };
    } else {
      // For AI-generated games
      switch (selectedGameType) {
        case "guess":
          configToSend = {
            minNumber: aiGameConfig.minNumber,
            maxNumber: aiGameConfig.maxNumber,
            maxGuesses: aiGameConfig.maxGuesses,
            hintFrequency: aiGameConfig.hintFrequency,
          };
          break;
        case "trivia":
          configToSend = {
            timePerQuestion: aiGameConfig.timePerQuestion,
            pointsPerQuestion: aiGameConfig.pointsPerQuestion,
            allowPartialMatches: aiGameConfig.allowPartialMatches,
          };
          break;
        case "word":
          configToSend = {
            minWordLength: aiGameConfig.minWordLength,
            maxWordLength: aiGameConfig.maxWordLength,
            timeLimit: aiGameConfig.timeLimit,
            allowPluralForms: aiGameConfig.allowPluralForms,
          };
          break;
        case "story":
          configToSend = {
            maxContributionLength: aiGameConfig.maxContributionLength,
            turnTimeLimit: aiGameConfig.turnTimeLimit,
          };
          break;
        default:
          // For other game types, just send auto-start settings
          break;
      }
    }

    const payload = {
      gameId: selectedGame,
      config: configToSend,
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

  // Handler to save ALL settings including enabling Auto-Start
  const handleSaveWithAutoStart = async () => {
    setIsSaving(true);
    setSaveStatusMessage("");

    // Get the current interval based on game type
    const currentIntervalForPayload = getIntervalForPayload(
      selectedGame === "guess-the-number"
        ? guessConfig.autoStartIntervalMinutes
        : aiGameConfig.autoStartIntervalMinutes
    );

    // Validate interval since autoStart is being enabled
    if (
      typeof currentIntervalForPayload === "undefined" ||
      currentIntervalForPayload === null ||
      currentIntervalForPayload < 3
    ) {
      setSaveStatusMessage(
        "Error: Auto-start interval must be 3 minutes or more."
      );
      setIsSaving(false);
      return;
    }

    // Prepare config based on game type
    let configToSend: Partial<GameConfigPayload> = {
      // Always include auto-start settings
      autoStartEnabled: true, // Explicitly true
      autoStartIntervalMinutes: currentIntervalForPayload,
      randomizeGamesOnAutoStart:
        selectedGame === "guess-the-number"
          ? guessConfig.randomizeGamesOnAutoStart
          : aiGameConfig.randomizeGamesOnAutoStart,
    };

    if (selectedGame === "guess-the-number") {
      // For hardcoded Guess the Number game
      configToSend = {
        ...configToSend,
        minNumber: guessConfig.minNumber,
        maxNumber: guessConfig.maxNumber,
      };
    } else {
      // For AI-generated games
      switch (selectedGameType) {
        case "guess":
          configToSend = {
            ...configToSend,
            minNumber: aiGameConfig.minNumber,
            maxNumber: aiGameConfig.maxNumber,
            maxGuesses: aiGameConfig.maxGuesses,
            hintFrequency: aiGameConfig.hintFrequency,
          };
          break;
        case "trivia":
          configToSend = {
            ...configToSend,
            timePerQuestion: aiGameConfig.timePerQuestion,
            pointsPerQuestion: aiGameConfig.pointsPerQuestion,
            allowPartialMatches: aiGameConfig.allowPartialMatches,
          };
          break;
        case "word":
          configToSend = {
            ...configToSend,
            minWordLength: aiGameConfig.minWordLength,
            maxWordLength: aiGameConfig.maxWordLength,
            timeLimit: aiGameConfig.timeLimit,
            allowPluralForms: aiGameConfig.allowPluralForms,
          };
          break;
        case "story":
          configToSend = {
            ...configToSend,
            maxContributionLength: aiGameConfig.maxContributionLength,
            turnTimeLimit: aiGameConfig.turnTimeLimit,
          };
          break;
        default:
          // For other game types, just send auto-start settings
          break;
      }
    }

    const payload = {
      gameId: selectedGame,
      config: configToSend,
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

    // Prepare config based on game type
    let configToSend: Partial<GameConfigPayload> = {
      // Always include auto-start settings
      autoStartEnabled: false,
      autoStartIntervalMinutes: null, // Send null when disabling
    };

    if (selectedGame === "guess-the-number") {
      // For hardcoded Guess the Number game
      configToSend = {
        ...configToSend,
        minNumber: guessConfig.minNumber,
        maxNumber: guessConfig.maxNumber,
      };
    } else {
      // For AI-generated games
      switch (selectedGameType) {
        case "guess":
          configToSend = {
            ...configToSend,
            minNumber: aiGameConfig.minNumber,
            maxNumber: aiGameConfig.maxNumber,
            maxGuesses: aiGameConfig.maxGuesses,
            hintFrequency: aiGameConfig.hintFrequency,
          };
          break;
        case "trivia":
          configToSend = {
            ...configToSend,
            timePerQuestion: aiGameConfig.timePerQuestion,
            pointsPerQuestion: aiGameConfig.pointsPerQuestion,
            allowPartialMatches: aiGameConfig.allowPartialMatches,
          };
          break;
        case "word":
          configToSend = {
            ...configToSend,
            minWordLength: aiGameConfig.minWordLength,
            maxWordLength: aiGameConfig.maxWordLength,
            timeLimit: aiGameConfig.timeLimit,
            allowPluralForms: aiGameConfig.allowPluralForms,
          };
          break;
        case "story":
          configToSend = {
            ...configToSend,
            maxContributionLength: aiGameConfig.maxContributionLength,
            turnTimeLimit: aiGameConfig.turnTimeLimit,
          };
          break;
        default:
          // For other game types, just send auto-start settings
          break;
      }
    }

    const payload = { gameId: selectedGame, config: configToSend };

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
      if (selectedGame === "guess-the-number") {
        setGuessConfig((prev) => ({
          ...prev,
          autoStartEnabled: false,
          autoStartIntervalMinutes: "", // Set interval to empty string in state
        }));
      } else {
        setAiGameConfig((prev) => ({
          ...prev,
          autoStartEnabled: false,
          autoStartIntervalMinutes: "", // Set interval to empty string in state
        }));
      }

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
      // Prepare options based on game type
      let optionsToSend: Partial<GameConfigPayload> = {};

      if (selectedGame === "guess-the-number") {
        // For hardcoded Guess the Number game
        optionsToSend = {
          minNumber: guessConfig.minNumber,
          maxNumber: guessConfig.maxNumber,
        };
      } else {
        // For AI-generated games
        switch (selectedGameType) {
          case "guess":
            optionsToSend = {
              minNumber: aiGameConfig.minNumber,
              maxNumber: aiGameConfig.maxNumber,
              maxGuesses: aiGameConfig.maxGuesses,
              hintFrequency: aiGameConfig.hintFrequency,
            };
            break;
          case "trivia":
            optionsToSend = {
              timePerQuestion: aiGameConfig.timePerQuestion,
              pointsPerQuestion: aiGameConfig.pointsPerQuestion,
              allowPartialMatches: aiGameConfig.allowPartialMatches,
            };
            break;
          case "word":
            optionsToSend = {
              minWordLength: aiGameConfig.minWordLength,
              maxWordLength: aiGameConfig.maxWordLength,
              timeLimit: aiGameConfig.timeLimit,
              allowPluralForms: aiGameConfig.allowPluralForms,
            };
            break;
          case "story":
            optionsToSend = {
              maxContributionLength: aiGameConfig.maxContributionLength,
              turnTimeLimit: aiGameConfig.turnTimeLimit,
            };
            break;
          default:
            // For other game types, send empty options
            break;
        }
      }

      await onStartGame(selectedGame, optionsToSend);
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
        title={t("gameManagement.title")}
        subheader={t("gameManagement.subtitle")}
        action={
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setIsWizardOpen(true)} // Open the wizard
            sx={{ mr: 1 }}
          >
            {t("gameManagement.newGame")}
          </Button>
        }
      />
      {/* Game Status and Controls Section */}
      <CardContent sx={{ flexGrow: 0 }}>
        <Typography variant="h6" gutterBottom>
          {t("gameManagement.gameStatus")}
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
              ? t("gameManagement.processing")
              : isGameActive
              ? `${t("gameManagement.active")} ${
                  gameStatus?.name || "Unknown Game"
                }`
              : savedAutoStartEnabled
              ? t("gameManagement.autoStartEnabled")
              : t("gameManagement.noGameActive")}
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
            {t("gameManagement.startGame")}
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
            {t("gameManagement.stopGame")}
          </Button>
        </Box>
      </CardContent>

      <Divider sx={{ my: 1 }} />

      {/* Game Configuration Section */}
      <CardContent sx={{ flexGrow: 1, overflowY: "auto" }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          {t("gameConfig.title")}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControl fullWidth size="small" disabled={disableConfigInputs}>
            <InputLabel id="game-config-select-label">
              {t("gameManagement.selectGameToConfig")}
            </InputLabel>
            <Select
              labelId="game-config-select-label"
              id="game-config-select"
              value={selectedGame}
              label={t("gameManagement.selectGameToConfig")}
              onChange={(e) => setSelectedGame(e.target.value)}
              disabled={disableConfigInputs}
            >
              <MenuItem value="guess-the-number">
                {t("gameConfig.guessTheNumber")}
              </MenuItem>
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
                    <ListItemText
                      primary={`${game.name} (${t("gameConfig.aiGenerated")})`}
                    />
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

          {/* Hardcoded Guess the Number Game Configuration */}
          {selectedGame === "guess-the-number" && (
            <>
              <TextField
                id="config-min-number"
                label={t("gameManagement.minNumberRange")}
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
                label={t("gameManagement.maxNumberRange", {
                  min: guessConfig.minNumber + 1,
                })}
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
                {isSaving
                  ? t("common.saving")
                  : t("gameManagement.saveMinMaxConfig")}
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
                label={t("gameManagement.enableAutoStart")}
                sx={{ mt: 1 }}
              />
              {guessConfig.autoStartEnabled && (
                <>
                  <TextField
                    id="auto-start-interval"
                    label={t("gameConfig.autoStartInterval")}
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
                    sx={{ mb: 1 }}
                  />

                  {/* Randomize Games Checkbox */}
                  <FormControlLabel
                    control={
                      <Checkbox
                        id="randomize-games-on-auto-start"
                        checked={guessConfig.randomizeGamesOnAutoStart ?? false}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setGuessConfig((prev) => ({
                            ...prev,
                            randomizeGamesOnAutoStart: e.target.checked,
                          }))
                        }
                        size="small"
                        disabled={disableConfigInputs}
                      />
                    }
                    label={t("gameConfig.randomizeGames")}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", ml: 4, mt: -1 }}
                  >
                    {t("gameConfig.randomizeDescription")}
                  </Typography>
                </>
              )}
            </>
          )}

          {/* AI-Generated Game Configuration */}
          {selectedGame !== "guess-the-number" && (
            <>
              {/* Game Type Specific Configuration */}
              {selectedGameType === "guess" && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Guess Game Settings
                  </Typography>
                  <TextField
                    id="ai-config-min-number"
                    label="Min Number (1-999)"
                    type="number"
                    InputProps={{ inputProps: { min: 1, max: 999 } }}
                    value={aiGameConfig.minNumber || 1}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      const newMin = isNaN(val)
                        ? 1
                        : Math.max(1, Math.min(999, val));
                      setAiGameConfig((prev) => ({
                        ...prev,
                        minNumber: newMin,
                        maxNumber: Math.max(newMin + 1, prev.maxNumber || 100),
                      }));
                    }}
                    fullWidth
                    variant="outlined"
                    size="small"
                    disabled={disableConfigInputs}
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    id="ai-config-max-number"
                    label={`Max Number (${
                      (aiGameConfig.minNumber || 1) + 1
                    }-1000)`}
                    type="number"
                    InputProps={{
                      inputProps: {
                        min: (aiGameConfig.minNumber || 1) + 1,
                        max: 1000,
                      },
                    }}
                    value={aiGameConfig.maxNumber || 100}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      const newMax = isNaN(val)
                        ? (aiGameConfig.minNumber || 1) + 1
                        : Math.max(
                            (aiGameConfig.minNumber || 1) + 1,
                            Math.min(1000, val)
                          );
                      setAiGameConfig((prev) => ({
                        ...prev,
                        maxNumber: newMax,
                      }));
                    }}
                    fullWidth
                    variant="outlined"
                    size="small"
                    disabled={disableConfigInputs}
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    id="ai-config-max-guesses"
                    label="Max Guesses (0 for unlimited)"
                    type="number"
                    InputProps={{ inputProps: { min: 0, max: 100 } }}
                    value={aiGameConfig.maxGuesses || 0}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      const newVal = isNaN(val)
                        ? 0
                        : Math.max(0, Math.min(100, val));
                      setAiGameConfig((prev) => ({
                        ...prev,
                        maxGuesses: newVal,
                      }));
                    }}
                    fullWidth
                    variant="outlined"
                    size="small"
                    disabled={disableConfigInputs}
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    id="ai-config-hint-frequency"
                    label="Hint Frequency (guesses between hints, 0 for no hints)"
                    type="number"
                    InputProps={{ inputProps: { min: 0, max: 20 } }}
                    value={aiGameConfig.hintFrequency || 5}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      const newVal = isNaN(val)
                        ? 5
                        : Math.max(0, Math.min(20, val));
                      setAiGameConfig((prev) => ({
                        ...prev,
                        hintFrequency: newVal,
                      }));
                    }}
                    fullWidth
                    variant="outlined"
                    size="small"
                    disabled={disableConfigInputs}
                    sx={{ mb: 1 }}
                  />
                </>
              )}

              {selectedGameType === "trivia" && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Trivia Game Settings
                  </Typography>
                  <TextField
                    id="ai-config-time-per-question"
                    label="Time Per Question (seconds)"
                    type="number"
                    InputProps={{ inputProps: { min: 10, max: 300 } }}
                    value={aiGameConfig.timePerQuestion || 30}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      const newVal = isNaN(val)
                        ? 30
                        : Math.max(10, Math.min(300, val));
                      setAiGameConfig((prev) => ({
                        ...prev,
                        timePerQuestion: newVal,
                      }));
                    }}
                    fullWidth
                    variant="outlined"
                    size="small"
                    disabled={disableConfigInputs}
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    id="ai-config-points-per-question"
                    label="Points Per Question"
                    type="number"
                    InputProps={{ inputProps: { min: 1, max: 100 } }}
                    value={aiGameConfig.pointsPerQuestion || 10}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      const newVal = isNaN(val)
                        ? 10
                        : Math.max(1, Math.min(100, val));
                      setAiGameConfig((prev) => ({
                        ...prev,
                        pointsPerQuestion: newVal,
                      }));
                    }}
                    fullWidth
                    variant="outlined"
                    size="small"
                    disabled={disableConfigInputs}
                    sx={{ mb: 1 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        id="ai-config-allow-partial-matches"
                        checked={aiGameConfig.allowPartialMatches ?? true}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setAiGameConfig((prev) => ({
                            ...prev,
                            allowPartialMatches: e.target.checked,
                          }))
                        }
                        size="small"
                        disabled={disableConfigInputs}
                      />
                    }
                    label="Allow Partial Matches"
                    sx={{ mb: 1 }}
                  />
                </>
              )}

              {selectedGameType === "word" && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Word Game Settings
                  </Typography>
                  <TextField
                    id="ai-config-min-word-length"
                    label="Min Word Length"
                    type="number"
                    InputProps={{ inputProps: { min: 2, max: 10 } }}
                    value={aiGameConfig.minWordLength || 3}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      const newVal = isNaN(val)
                        ? 3
                        : Math.max(2, Math.min(10, val));
                      setAiGameConfig((prev) => ({
                        ...prev,
                        minWordLength: newVal,
                        maxWordLength: Math.max(
                          newVal,
                          prev.maxWordLength || 10
                        ),
                      }));
                    }}
                    fullWidth
                    variant="outlined"
                    size="small"
                    disabled={disableConfigInputs}
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    id="ai-config-max-word-length"
                    label="Max Word Length"
                    type="number"
                    InputProps={{
                      inputProps: {
                        min: aiGameConfig.minWordLength || 3,
                        max: 20,
                      },
                    }}
                    value={aiGameConfig.maxWordLength || 10}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      const newVal = isNaN(val)
                        ? 10
                        : Math.max(
                            aiGameConfig.minWordLength || 3,
                            Math.min(20, val)
                          );
                      setAiGameConfig((prev) => ({
                        ...prev,
                        maxWordLength: newVal,
                      }));
                    }}
                    fullWidth
                    variant="outlined"
                    size="small"
                    disabled={disableConfigInputs}
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    id="ai-config-time-limit"
                    label="Time Limit (seconds)"
                    type="number"
                    InputProps={{ inputProps: { min: 10, max: 300 } }}
                    value={aiGameConfig.timeLimit || 60}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      const newVal = isNaN(val)
                        ? 60
                        : Math.max(10, Math.min(300, val));
                      setAiGameConfig((prev) => ({
                        ...prev,
                        timeLimit: newVal,
                      }));
                    }}
                    fullWidth
                    variant="outlined"
                    size="small"
                    disabled={disableConfigInputs}
                    sx={{ mb: 1 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        id="ai-config-allow-plural-forms"
                        checked={aiGameConfig.allowPluralForms ?? true}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setAiGameConfig((prev) => ({
                            ...prev,
                            allowPluralForms: e.target.checked,
                          }))
                        }
                        size="small"
                        disabled={disableConfigInputs}
                      />
                    }
                    label="Allow Plural Forms"
                    sx={{ mb: 1 }}
                  />
                </>
              )}

              {selectedGameType === "story" && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Story Game Settings
                  </Typography>
                  <TextField
                    id="ai-config-max-contribution-length"
                    label="Max Contribution Length (characters)"
                    type="number"
                    InputProps={{ inputProps: { min: 50, max: 500 } }}
                    value={aiGameConfig.maxContributionLength || 100}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      const newVal = isNaN(val)
                        ? 100
                        : Math.max(50, Math.min(500, val));
                      setAiGameConfig((prev) => ({
                        ...prev,
                        maxContributionLength: newVal,
                      }));
                    }}
                    fullWidth
                    variant="outlined"
                    size="small"
                    disabled={disableConfigInputs}
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    id="ai-config-turn-time-limit"
                    label="Turn Time Limit (seconds)"
                    type="number"
                    InputProps={{ inputProps: { min: 10, max: 300 } }}
                    value={aiGameConfig.turnTimeLimit || 60}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      const newVal = isNaN(val)
                        ? 60
                        : Math.max(10, Math.min(300, val));
                      setAiGameConfig((prev) => ({
                        ...prev,
                        turnTimeLimit: newVal,
                      }));
                    }}
                    fullWidth
                    variant="outlined"
                    size="small"
                    disabled={disableConfigInputs}
                    sx={{ mb: 1 }}
                  />
                </>
              )}

              {/* Button to save game-specific settings */}
              <Button
                variant="contained"
                color="secondary"
                startIcon={<SaveIcon />}
                onClick={handleSaveBaseConfig}
                disabled={isSaving || isGameActive || isFetchingConfig}
                sx={{ mt: 1 }}
              >
                {isSaving ? "Saving..." : "Save Game Settings"}
              </Button>

              {/* Auto-start settings for AI games */}
              <FormControlLabel
                control={
                  <Checkbox
                    id="ai-auto-start-enabled"
                    checked={aiGameConfig.autoStartEnabled ?? false}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setAiGameConfig((prev) => ({
                        ...prev,
                        autoStartEnabled: e.target.checked,
                      }))
                    }
                    size="small"
                    disabled={disableConfigInputs}
                  />
                }
                label="Enable Automatic Game Start"
                sx={{ mt: 2 }}
              />
              {aiGameConfig.autoStartEnabled && (
                <>
                  <TextField
                    id="ai-auto-start-interval"
                    label="Start Interval (minutes, 3-1440)"
                    type="number"
                    InputProps={{ inputProps: { min: 3, max: 1440 } }}
                    value={aiGameConfig.autoStartIntervalMinutes ?? ""}
                    onChange={(e) => {
                      const rawValue = e.target.value;
                      if (rawValue === "") {
                        setAiGameConfig((prev) => ({
                          ...prev,
                          autoStartIntervalMinutes: "",
                        }));
                      } else {
                        const val = parseInt(rawValue, 10);
                        const clampedVal = isNaN(val)
                          ? 3
                          : Math.max(3, Math.min(1440, val));
                        setAiGameConfig((prev) => ({
                          ...prev,
                          autoStartIntervalMinutes: clampedVal,
                        }));
                      }
                    }}
                    fullWidth
                    variant="outlined"
                    size="small"
                    disabled={
                      !aiGameConfig.autoStartEnabled || disableConfigInputs
                    }
                    sx={{ mt: 1, mb: 1 }}
                  />

                  {/* Randomize Games Checkbox */}
                  <FormControlLabel
                    control={
                      <Checkbox
                        id="ai-randomize-games-on-auto-start"
                        checked={
                          aiGameConfig.randomizeGamesOnAutoStart ?? false
                        }
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setAiGameConfig((prev) => ({
                            ...prev,
                            randomizeGamesOnAutoStart: e.target.checked,
                          }))
                        }
                        size="small"
                        disabled={disableConfigInputs}
                      />
                    }
                    label="Randomize Game Selection on Auto-Start"
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", ml: 4, mt: -1 }}
                  >
                    When enabled, a random game will be selected from your
                    available games each time auto-start triggers
                  </Typography>
                </>
              )}
            </>
          )}

          {/* --- Conditional Save/Action Buttons for Auto-Start --- */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
            {/* "Save Config & Auto-Start Settings" button - Green, visible only when checkbox IS checked */}
            {((selectedGame === "guess-the-number" &&
              guessConfig.autoStartEnabled) ||
              (selectedGame !== "guess-the-number" &&
                aiGameConfig.autoStartEnabled)) && (
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
