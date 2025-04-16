import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
import { Box, Typography, Grid } from "@mui/material";

// Import the new MUI components using named imports
import { GameManagement } from "../components/Dashboard/GameManagement";
import { BotConfiguration } from "../components/Dashboard/BotConfiguration";
import { ModerationSettings } from "../components/Dashboard/ModerationSettings";
import { Analytics } from "../components/Dashboard/Analytics";
import { ChatbotControl } from "../components/Dashboard/ChatbotControl";
import { DashboardShell } from "../components/DashboardShell";

// Keep the existing props interface
interface DashboardPageProps {
  user: {
    twitchId: string;
    login: string;
    displayName: string;
  } | null;
  onLogout: () => void;
}

// Define a type for the moderation settings state used within this page component
interface ModerationSettingsState {
  enableBasicModeration: boolean; // Renamed from moderationEnabled for clarity in frontend state
  bannedWords: string; // Store as comma-separated string in state for the TextField
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user, onLogout }) => {
  // --- State for Chatbot Connection ---
  const [isConnected, setIsConnected] = useState(false);
  const [isBotStatusLoading, setIsBotStatusLoading] = useState(true);
  const [botStatusError, setBotStatusError] = useState<string | null>(null);

  // --- State for Game Status ---
  const [gameStatus, setGameStatus] = useState<null | {
    isActive: boolean;
    name?: string;
  }>(null);
  const [isGameStatusLoading, setIsGameStatusLoading] = useState(true);
  const [gameStatusError, setGameStatusError] = useState<string | null>(null);

  // --- State for Moderation Settings ---
  const [moderationSettings, setModerationSettings] =
    useState<ModerationSettingsState | null>(null);
  const [isModSettingsLoading, setIsModSettingsLoading] = useState(true);
  const [modSettingsError, setModSettingsError] = useState<string | null>(null);

  // --- State for Config Components (Placeholders for now) ---
  const [gameConfig, setGameConfig] = useState({
    selectedGame: "guess-the-number",
    maxNumber: 100,
  });
  const [botConfig, setBotConfig] = useState({
    commandPrefix: "!",
  });
  const [analyticsData] = useState({
    totalGamesPlayed: 15,
    uniquePlayersToday: 8,
  });

  // --- Fetch Initial Data ---
  useEffect(() => {
    const fetchBotStatus = async () => {
      setBotStatusError(null);
      setIsBotStatusLoading(true);
      try {
        const response = await fetch("/api/chatbot/status");
        if (!response.ok) {
          throw new Error(`Failed to fetch bot status: ${response.statusText}`);
        }
        const data = await response.json();
        setIsConnected(data.isConnected);
      } catch (err) {
        console.error("Error fetching bot status:", err);
        setBotStatusError(
          err instanceof Error ? err.message : "Failed to fetch bot status"
        );
        setIsConnected(false);
      } finally {
        setIsBotStatusLoading(false);
      }
    };

    const fetchGameStatus = async () => {
      setGameStatusError(null);
      setIsGameStatusLoading(true);
      try {
        const response = await fetch("/api/games/status");
        if (!response.ok) {
          if (response.status === 404) {
            setGameStatus({ isActive: false });
            return;
          }
          throw new Error(
            `Failed to fetch game status: ${response.statusText}`
          );
        }
        const data = await response.json();
        setGameStatus(data);
      } catch (err) {
        console.error("Error fetching game status:", err);
        setGameStatusError(
          err instanceof Error ? err.message : "Failed to fetch game status"
        );
        setGameStatus({ isActive: false });
      } finally {
        setIsGameStatusLoading(false);
      }
    };

    const fetchModerationSettings = async () => {
      setModSettingsError(null);
      setIsModSettingsLoading(true);
      try {
        const response = await fetch("/api/moderation/settings");
        if (!response.ok) {
          throw new Error(
            `Failed to fetch moderation settings: ${response.statusText}`
          );
        }
        const data = await response.json();
        // Convert backend format (moderationEnabled, bannedWords: string[])
        // to frontend state format (enableBasicModeration, bannedWords: string)
        setModerationSettings({
          enableBasicModeration: data.moderationEnabled ?? false,
          bannedWords: (data.bannedWords ?? []).join(", "),
        });
      } catch (err) {
        console.error("Error fetching moderation settings:", err);
        setModSettingsError(
          err instanceof Error
            ? err.message
            : "Failed to fetch moderation settings"
        );
        // Set default state on error
        setModerationSettings({
          enableBasicModeration: false,
          bannedWords: "",
        });
      } finally {
        setIsModSettingsLoading(false);
      }
    };

    // Run all fetches
    fetchBotStatus();
    fetchGameStatus();
    fetchModerationSettings();
  }, []);

  // --- Save Handlers ---
  const handleGameConfigSave = useCallback(
    async (config: typeof gameConfig) => {
      console.log("Saving Game Config (Placeholder):", config);
      setGameConfig(config);
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Example: throw new Error("Simulated save error");
    },
    []
  );

  const handleBotConfigSave = useCallback(async (config: typeof botConfig) => {
    console.log("Saving Bot Config (Placeholder):", config);
    setBotConfig(config);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }, []);

  // Implement the actual save logic for moderation settings
  const handleModerationSettingsSave = useCallback(
    async (settings: ModerationSettingsState) => {
      // Loading/Error state should be handled within the ModerationSettings component itself
      console.log("Attempting to save Moderation Settings:", settings);
      try {
        // Prepare data for the backend DTO
        const updateDto = {
          moderationEnabled: settings.enableBasicModeration,
          bannedWords: settings.bannedWords, // Send as comma-separated string
        };

        const response = await fetch("/api/moderation/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateDto),
        });

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: "Save failed" }));
          throw new Error(
            `Failed to save settings: ${
              errorData.message || response.statusText
            }`
          );
        }

        // Update local state on successful save
        setModerationSettings(settings);
        console.log("Moderation settings saved successfully.");
        // Let the child component handle success message display
      } catch (err) {
        console.error("Error saving moderation settings:", err);
        // Re-throw the error so the child component can display it
        throw err;
      }
    },
    []
  );

  // --- API Calls for Chatbot ---
  const connectBot = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch("/api/chatbot/connect", { method: "POST" });
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Connection failed" }));
        throw new Error(
          `Failed to connect: ${errorData.message || response.statusText}`
        );
      }
      const statusResponse = await fetch("/api/chatbot/status");
      if (!statusResponse.ok)
        throw new Error("Failed to verify connection status");
      const statusData = await statusResponse.json();
      setIsConnected(statusData.isConnected);
    } catch (err) {
      console.error("Error connecting bot:", err);
      setIsConnected(false);
      throw err;
    }
  }, []);

  const disconnectBot = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch("/api/chatbot/disconnect", {
        method: "POST",
      });
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Disconnection failed" }));
        throw new Error(
          `Failed to disconnect: ${errorData.message || response.statusText}`
        );
      }
      const statusResponse = await fetch("/api/chatbot/status");
      if (!statusResponse.ok)
        throw new Error("Failed to verify disconnection status");
      const statusData = await statusResponse.json();
      setIsConnected(statusData.isConnected);
    } catch (err) {
      console.error("Error disconnecting bot:", err);
      const statusResponse = await fetch("/api/chatbot/status").catch(
        () => null
      );
      if (statusResponse?.ok) {
        const statusData = await statusResponse.json();
        setIsConnected(statusData.isConnected);
      }
      throw err;
    }
  }, []);

  // --- API Calls for Game Engine ---
  const startGame = useCallback(
    async (gameId: string, options: any): Promise<void> => {
      try {
        const response = await fetch("/api/games/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId, options }),
        });
        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: "Start game failed" }));
          throw new Error(
            `Failed to start game: ${errorData.message || response.statusText}`
          );
        }
        const statusResponse = await fetch("/api/games/status");
        if (!statusResponse.ok)
          throw new Error("Failed to verify game start status");
        const statusData = await statusResponse.json();
        setGameStatus(statusData);
      } catch (err) {
        console.error("Error starting game:", err);
        const statusResponse = await fetch("/api/games/status").catch(
          () => null
        );
        if (statusResponse?.ok) {
          const statusData = await statusResponse.json();
          setGameStatus(statusData);
        } else {
          setGameStatus({ isActive: false });
        }
        throw err;
      }
    },
    []
  );

  const stopGame = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch("/api/games/stop", { method: "POST" });
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Stop game failed" }));
        throw new Error(
          `Failed to stop game: ${errorData.message || response.statusText}`
        );
      }
      const statusResponse = await fetch("/api/games/status");
      if (!statusResponse.ok)
        throw new Error("Failed to verify game stop status");
      const statusData = await statusResponse.json();
      setGameStatus(statusData);
    } catch (err) {
      console.error("Error stopping game:", err);
      const statusResponse = await fetch("/api/games/status").catch(() => null);
      if (statusResponse?.ok) {
        const statusData = await statusResponse.json();
        setGameStatus(statusData);
      } else {
        setGameStatus({ isActive: false });
      }
      throw err;
    }
  }, []);

  // --- Render Logic ---
  if (!user) {
    return <div>Error: User not logged in. Redirecting...</div>;
  }

  // Display loading indicator while fetching initial statuses
  if (isBotStatusLoading || isGameStatusLoading || isModSettingsLoading) {
    // Added mod settings loading check
    return (
      <DashboardShell user={user} onLogout={onLogout}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "calc(100vh - 64px)",
          }}
        >
          <Typography>Loading Dashboard...</Typography>
        </Box>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell user={user} onLogout={onLogout}>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage your Twitch MiniGameMaster settings and view analytics.
        </Typography>

        {/* Display initial status fetch errors */}
        {botStatusError && (
          <Typography color="error" sx={{ mb: 2 }}>
            Error loading chatbot status: {botStatusError}
          </Typography>
        )}
        {gameStatusError && (
          <Typography color="error" sx={{ mb: 2 }}>
            Error loading game status: {gameStatusError}
          </Typography>
        )}
        {modSettingsError && ( // Added mod settings error display
          <Typography color="error" sx={{ mb: 2 }}>
            Error loading moderation settings: {modSettingsError}
          </Typography>
        )}

        <Grid container spacing={3}>
          {/* Chatbot Control */}
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <ChatbotControl
              initialIsConnected={isConnected}
              onConnect={connectBot}
              onDisconnect={disconnectBot}
            />
          </Grid>

          {/* Game Management */}
          <Grid size={{ xs: 12, md: 6, lg: 8 }}>
            <GameManagement
              config={gameConfig}
              onSave={handleGameConfigSave}
              onStartGame={startGame}
              onStopGame={stopGame}
              initialGameStatus={gameStatus}
            />
          </Grid>

          {/* Bot Configuration */}
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <BotConfiguration config={botConfig} onSave={handleBotConfigSave} />
          </Grid>

          {/* Moderation Settings - Conditionally render only when settings are loaded */}
          {moderationSettings && (
            <Grid size={{ xs: 12, md: 6, lg: 8 }}>
              <ModerationSettings
                settings={moderationSettings} // Pass the non-null state
                onSave={handleModerationSettingsSave} // Pass the implemented save handler
              />
            </Grid>
          )}

          {/* Analytics */}
          <Grid size={{ xs: 12 }}>
            <Analytics data={analyticsData} />
          </Grid>
        </Grid>
      </Box>
    </DashboardShell>
  );
};

export default DashboardPage;
