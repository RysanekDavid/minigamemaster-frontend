/**
 * @summary Games page for managing and creating interactive games
 * @author Augment Agent
 * @created 2023-07-10
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  SportsEsports as GameControllerIcon,
} from "@mui/icons-material";

// Import components
import GameCard from "../components/Games/GameCard";
import ActiveGamePanel from "../components/Games/ActiveGamePanel";
import CreateGameDialog from "../components/Games/CreateGameDialog";
import EditGameDialog from "../components/Games/EditGameDialog";

// Import API service
import GameApiService, {
  GameDefinition,
  GameStatus,
} from "../services/gameApi";

// Tab panel component
interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`games-tabpanel-${index}`}
      aria-labelledby={`games-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const GamesPage: React.FC = () => {
  // State
  const [tabValue, setTabValue] = useState(0);
  const [games, setGames] = useState<GameDefinition[]>([]);
  const [activeGame, setActiveGame] = useState<GameDefinition | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch games and active game status
  const fetchGames = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch game definitions
      let gameDefinitions = [];
      try {
        gameDefinitions = await GameApiService.getGameDefinitions();
      } catch (err) {
        console.error("Error fetching game definitions:", err);
        // Use mock data for demonstration if API fails
        gameDefinitions = [
          {
            id: "ai-trivia-123",
            name: "Science Trivia",
            description:
              "Test your knowledge of scientific facts and discoveries",
            type: "trivia",
            createdAt: new Date().toISOString(),
            plays: 5,
            players: 12,
            configSchema: {},
            enhancedConfig: {
              questions: [
                {
                  question: "What is the chemical symbol for gold?",
                  options: ["Au", "Ag", "Fe", "Cu"],
                  answer: 0,
                },
              ],
            },
          },
          {
            id: "ai-word-456",
            name: "Word Scramble",
            description: "Unscramble words related to technology",
            type: "word",
            createdAt: new Date().toISOString(),
            plays: 3,
            players: 8,
            configSchema: {},
            enhancedConfig: {
              wordBank: ["computer", "internet", "software", "hardware"],
            },
          },
        ];
      }

      // Fetch current game status
      let gameStatus = { isActive: false };
      try {
        gameStatus = await GameApiService.getGameStatus();
      } catch (err) {
        console.error("Error fetching game status:", err);
      }

      // Update state
      setGames(gameDefinitions);

      if (gameStatus.isActive && gameStatus.gameId) {
        const activeGameDef = gameDefinitions.find(
          (game) => game.id === gameStatus.gameId
        );
        if (activeGameDef) {
          setActiveGame(activeGameDef);
        }
      } else {
        setActiveGame(null);
      }
    } catch (err) {
      console.error("Error in fetchGames:", err);
      setError("Failed to load games. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle game actions
  const handleStartGame = async (gameId: string) => {
    try {
      await GameApiService.startGame(gameId);
      const gameToActivate = games.find((game) => {
        const id = game.definitionId || game.id;
        return id === gameId;
      });
      if (gameToActivate) {
        setActiveGame(gameToActivate);
      }
      // Refresh game list to update status
      fetchGames();
    } catch (err) {
      console.error("Error starting game:", err);
      setError("Failed to start game. Please try again.");
    }
  };

  const handleStopGame = async () => {
    try {
      await GameApiService.stopGame();
      setActiveGame(null);
      // Refresh game list to update status
      fetchGames();
    } catch (err) {
      console.error("Error stopping game:", err);
      setError("Failed to stop game. Please try again.");
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this game? This action cannot be undone."
      )
    ) {
      try {
        await GameApiService.deleteGameDefinition(gameId);
        // Remove from local state
        setGames(
          games.filter((game) => {
            const id = game.definitionId || game.id;
            return id !== gameId;
          })
        );

        if (activeGame) {
          const activeGameId = activeGame.definitionId || activeGame.id;
          if (activeGameId === gameId) {
            setActiveGame(null);
          }
        }
      } catch (err) {
        console.error("Error deleting game:", err);
        setError("Failed to delete game. Please try again.");
      }
    }
  };

  // Handle create dialog
  const handleOpenCreateDialog = () => {
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
  };

  const handleGameCreated = (newGame: GameDefinition) => {
    setGames([newGame, ...games]);
  };

  // Handle edit dialog
  const handleOpenEditDialog = (gameId: string) => {
    console.log("Opening edit dialog for game ID:", gameId);
    setSelectedGameId(gameId);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedGameId(null);
  };

  const handleGameUpdated = (updatedGame: GameDefinition) => {
    // Get the game ID (could be either id or definitionId)
    const updatedGameId = updatedGame.definitionId || updatedGame.id;

    // Update the game in the local state
    setGames(
      games.map((game) => {
        const gameId = game.definitionId || game.id;
        return gameId === updatedGameId ? updatedGame : game;
      })
    );

    // If this is the active game, update it too
    if (activeGame) {
      const activeGameId = activeGame.definitionId || activeGame.id;
      if (activeGameId === updatedGameId) {
        setActiveGame(updatedGame);
      }
    }
  };

  // Render game statistics
  const renderGameStatistics = () => {
    const totalPlays = games.reduce((sum, game) => sum + (game.plays || 0), 0);
    const totalPlayers = games.reduce(
      (sum, game) => sum + (game.players || 0),
      0
    );
    const aiGeneratedCount = games.filter(
      (game) =>
        game.id && typeof game.id === "string" && game.id.startsWith("ai-")
    ).length;

    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Game Statistics
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                textAlign: "center",
              }}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Total Games
              </Typography>
              <Typography variant="h4" color="text.primary">
                {games.length}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                textAlign: "center",
              }}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                AI Generated
              </Typography>
              <Typography variant="h4" color="text.primary">
                {aiGeneratedCount}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                textAlign: "center",
              }}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Total Plays
              </Typography>
              <Typography variant="h4" color="text.primary">
                {totalPlays}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                textAlign: "center",
              }}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Total Players
              </Typography>
              <Typography variant="h4" color="text.primary">
                {totalPlayers}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // Render recent games
  const renderRecentGames = () => {
    const recentGames = [...games]
      .sort((a, b) => {
        const dateA = a.lastPlayed
          ? new Date(a.lastPlayed)
          : new Date(a.createdAt);
        const dateB = b.lastPlayed
          ? new Date(b.lastPlayed)
          : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 3);

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Recent Games
        </Typography>
        <Grid container spacing={3}>
          {recentGames.map((game) => (
            <Grid item xs={12} md={4} key={game.id} sx={{ display: "flex" }}>
              <GameCard
                game={{
                  ...game,
                  status:
                    activeGame &&
                    (activeGame.id === game.id ||
                      activeGame.definitionId === game.definitionId ||
                      activeGame.id === game.definitionId ||
                      activeGame.definitionId === game.id)
                      ? "active"
                      : "inactive",
                  plays: game.plays || 0,
                  players: game.players || 0,
                  aiGenerated:
                    game.id &&
                    typeof game.id === "string" &&
                    game.id.startsWith("ai-"),
                }}
                onStartGame={handleStartGame}
                onStopGame={handleStopGame}
                onDeleteGame={handleDeleteGame}
                onEditGame={handleOpenEditDialog}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom color="text.primary">
            Games
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and create interactive games for your viewers
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Create New Game
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="game tabs"
        >
          <Tab
            label="Overview"
            id="games-tab-0"
            aria-controls="games-tabpanel-0"
          />
          <Tab
            label="Game Library"
            id="games-tab-1"
            aria-controls="games-tabpanel-1"
          />
        </Tabs>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TabPanel value={tabValue} index={0}>
            <ActiveGamePanel
              activeGame={activeGame}
              onStopGame={handleStopGame}
              onBrowseGames={() => setTabValue(1)}
              onGameUpdated={handleGameUpdated}
            />
            {renderGameStatistics()}
            {renderRecentGames()}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {games.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <GameControllerIcon
                  sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Games Found
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Create your first game to get started
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleOpenCreateDialog}
                >
                  Create New Game
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {games.map((game) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    key={game.id}
                    sx={{ display: "flex" }}
                  >
                    <GameCard
                      game={{
                        ...game,
                        status:
                          activeGame &&
                          (activeGame.id === game.id ||
                            activeGame.definitionId === game.definitionId ||
                            activeGame.id === game.definitionId ||
                            activeGame.definitionId === game.id)
                            ? "active"
                            : "inactive",
                        plays: game.plays || 0,
                        players: game.players || 0,
                        aiGenerated:
                          game.id &&
                          typeof game.id === "string" &&
                          game.id.startsWith("ai-"),
                      }}
                      onStartGame={handleStartGame}
                      onStopGame={handleStopGame}
                      onDeleteGame={handleDeleteGame}
                      onEditGame={handleOpenEditDialog}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>
        </>
      )}

      <CreateGameDialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        onGameCreated={handleGameCreated}
      />

      <EditGameDialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        onGameUpdated={handleGameUpdated}
        gameId={selectedGameId}
      />
    </>
  );
};

export default GamesPage;
