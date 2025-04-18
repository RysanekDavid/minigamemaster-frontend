import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, Grid } from "@mui/material"; // Keep Grid import

// Import the dashboard components
import { GameManagement } from "../components/Dashboard/GameManagement";
import { BotConfiguration } from "../components/Dashboard/BotConfiguration";
import { ModerationSettings } from "../components/Dashboard/ModerationSettings";
import { Analytics } from "../components/Dashboard/Analytics";
import { ChatbotControl } from "../components/Dashboard/ChatbotControl";
// DashboardShell is no longer imported or used here

// Props are no longer needed from App.tsx for user/logout
interface DashboardPageProps {
  // These props are passed by App.tsx's renderContent, but might not be strictly needed
  // if user context/state management is handled differently later.
  // For now, keep the structure but don't rely on them for rendering decisions here.
  user: any;
  onLogout: any;
}

// Define a type for the moderation settings state used within this page component
interface ModerationSettingsState {
  enableBasicModeration: boolean;
  bannedWords: string;
}

// Remove unused props from signature completely
const DashboardPage: React.FC<DashboardPageProps> = () => {
  // --- State Definitions (Keep all existing state) ---
  const [isConnected, setIsConnected] = useState(false);
  const [isBotStatusLoading, setIsBotStatusLoading] = useState(true);
  const [botStatusError, setBotStatusError] = useState<string | null>(null);

  const [gameStatus, setGameStatus] = useState<null | {
    isActive: boolean;
    name?: string;
  }>(null);
  const [isGameStatusLoading, setIsGameStatusLoading] = useState(true);
  const [gameStatusError, setGameStatusError] = useState<string | null>(null);

  const [moderationSettings, setModerationSettings] =
    useState<ModerationSettingsState | null>(null);
  const [isModSettingsLoading, setIsModSettingsLoading] = useState(true);
  const [modSettingsError, setModSettingsError] = useState<string | null>(null);

  // --- Fetch Initial Data (Keep existing useEffect) ---
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
        setModerationSettings({
          enableBasicModeration: false,
          bannedWords: "",
        });
      } finally {
        setIsModSettingsLoading(false);
      }
    };

    fetchBotStatus();
    fetchGameStatus();
    fetchModerationSettings();
  }, []);

  // --- Save Handlers (Keep existing save handlers) ---
  const handleModerationSettingsSave = useCallback(
    async (settings: ModerationSettingsState) => {
      console.log("Attempting to save Moderation Settings:", settings);
      try {
        const updateDto = {
          moderationEnabled: settings.enableBasicModeration,
          bannedWords: settings.bannedWords,
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
        setModerationSettings(settings);
        console.log("Moderation settings saved successfully.");
        // Removed potentially problematic throw err from try block
      } catch (err) {
        console.error("Error saving moderation settings:", err);
        throw err; // Keep this one to propagate error to the component
      }
    },
    []
  );

  // --- API Calls (Keep existing API call functions) ---
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
  // Removed the check for !user as ProtectedRoute handles it
  // Removed DashboardShell wrapper from loading state
  if (isBotStatusLoading || isGameStatusLoading || isModSettingsLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 150px)", // Adjust height assuming header/padding
        }}
      >
        <Typography>Loading Dashboard...</Typography>
        {/* Consider adding a CircularProgress component */}
      </Box>
    );
  }

  // Main content rendering - No DashboardShell wrapper here
  return (
    <>
      {/* Page Title and Description (from inspiration) */}
      <Typography variant="h4" gutterBottom color="text.primary">
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
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
      {modSettingsError && (
        <Typography color="error" sx={{ mb: 2 }}>
          Error loading moderation settings: {modSettingsError}
        </Typography>
      )}

      {/* Grid layout using correct MUI v7 'size' prop */}
      <Grid container spacing={3}>
        {/* Chatbot Control (Full Width) */}
        <Grid size={12}>
          <ChatbotControl
            initialIsConnected={isConnected}
            onConnect={connectBot}
            onDisconnect={disconnectBot}
          />
          {/* Assuming ChatbotControl renders its own Card */}
        </Grid>

        {/* Game Management (Half Width on Medium+) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <GameManagement
            onStartGame={startGame}
            onStopGame={stopGame}
            initialGameStatus={gameStatus}
          />
          {/* Assuming GameManagement renders its own Card */}
        </Grid>

        {/* Bot Configuration (Half Width on Medium+) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <BotConfiguration />
          {/* Assuming BotConfiguration renders its own Card */}
        </Grid>

        {/* Moderation Settings (Full Width) */}
        {moderationSettings && (
          <Grid size={12}>
            <ModerationSettings
              settings={moderationSettings}
              onSave={handleModerationSettingsSave}
            />
            {/* Assuming ModerationSettings renders its own Card */}
          </Grid>
        )}

        {/* Analytics (Full Width) */}
        <Grid size={12}>
          <Analytics />
          {/* Assuming Analytics renders its own Card */}
        </Grid>
      </Grid>
    </>
  );
};

export default DashboardPage; // Ensure default export is present
