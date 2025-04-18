/**
 * @summary Component for displaying and managing the currently active game
 * @author Augment Agent
 * @created 2023-07-10
 */

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  alpha,
  useTheme,
} from "@mui/material";
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  SportsEsports as GameControllerIcon,
  AutoFixHigh as AIIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Extension as ExtensionIcon,
  Casino as CasinoIcon,
  Lightbulb as LightbulbIcon,
  Psychology as PsychologyIcon,
} from "@mui/icons-material";
import { GAME_TEMPLATES } from "./GameTypeSelector";

interface ActiveGamePanelProps {
  activeGame: {
    id: string;
    name: string;
    type: string;
    description: string;
    aiGenerated: boolean;
  } | null;
  onStopGame: () => void;
  onResetScores?: () => void;
  onBrowseGames: () => void;
}

const ActiveGamePanel: React.FC<ActiveGamePanelProps> = ({
  activeGame,
  onStopGame,
  onResetScores,
  onBrowseGames,
}) => {
  const theme = useTheme();

  if (!activeGame) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: 2,
          textAlign: "center",
          mb: 4,
          borderStyle: "dashed",
          borderColor: alpha(theme.palette.grey[500], 0.3),
          bgcolor: alpha(theme.palette.grey[100], 0.5),
        }}
      >
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          No Active Game
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Start a game from your library to engage your viewers
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<PlayIcon />}
          onClick={onBrowseGames}
        >
          Browse Games
        </Button>
      </Paper>
    );
  }

  // Get icon based on game type
  const getGameIcon = () => {
    if (!activeGame || !activeGame.type) return <GameControllerIcon />;

    const template = GAME_TEMPLATES.find((t) => t.id === activeGame.type);
    if (template) return template.icon;

    switch (activeGame.type) {
      case "trivia":
        return <QuestionAnswerIcon />;
      case "word":
        return <ExtensionIcon />;
      case "guess":
        return <CasinoIcon />;
      case "story":
        return <LightbulbIcon />;
      case "puzzle":
        return <PsychologyIcon />;
      default:
        return <GameControllerIcon />;
    }
  };

  // Get template name based on game type
  const getGameTypeName = () => {
    if (!activeGame || !activeGame.type) return "Game";

    const template = GAME_TEMPLATES.find((t) => t.id === activeGame.type);
    return template
      ? template.name
      : activeGame.type.charAt(0).toUpperCase() + activeGame.type.slice(1);
  };

  return (
    <Card sx={{ mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 3,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.success.main, 0.05),
        }}
      >
        <Avatar
          sx={{
            bgcolor: alpha(theme.palette.success.main, 0.2),
            color: "success.main",
            width: 48,
            height: 48,
            mr: 2,
          }}
        >
          {getGameIcon()}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="h6" color="text.primary">
              Active Game: {activeGame.name}
            </Typography>
            {activeGame.aiGenerated === true && (
              <AIIcon
                fontSize="small"
                sx={{ ml: 1, color: theme.palette.primary.main }}
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {getGameTypeName()}
          </Typography>
        </Box>
        <Chip
          label="Active"
          size="small"
          color="success"
          sx={{
            fontWeight: "medium",
            "& .MuiChip-label": { px: 1 },
          }}
        />
      </Box>

      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="subtitle2" gutterBottom>
              Game Status
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                mb: 3,
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    Current Players
                  </Typography>
                  <Typography variant="h5" color="text.primary">
                    14
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    Time Running
                  </Typography>
                  <Typography variant="h5" color="text.primary">
                    12:45
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    Current Round
                  </Typography>
                  <Typography variant="h5" color="text.primary">
                    3/10
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Typography variant="subtitle2" gutterBottom>
              Game Description
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {activeGame.description}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>
              Current Leaders
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                mb: 3,
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {[
                  { name: "Viewer123", score: 450 },
                  { name: "GameMaster", score: 380 },
                  { name: "StreamFan", score: 320 },
                ].map((player, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 1,
                      borderRadius: 1,
                      bgcolor:
                        index === 0
                          ? alpha(theme.palette.warning.main, 0.1)
                          : "transparent",
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        mr: 1.5,
                        bgcolor:
                          index === 0
                            ? "warning.main"
                            : index === 1
                            ? "grey.400"
                            : "grey.300",
                      }}
                    >
                      {index + 1}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {player.name}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      color={index === 0 ? "warning.dark" : "text.primary"}
                    >
                      {player.score}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>

            <Button
              fullWidth
              variant="outlined"
              color="error"
              onClick={onStopGame}
              startIcon={<StopIcon />}
              sx={{ mb: 2 }}
            >
              Stop Game
            </Button>

            {onResetScores && (
              <Button
                fullWidth
                variant="outlined"
                color="info"
                startIcon={<RefreshIcon />}
                onClick={onResetScores}
              >
                Reset Scores
              </Button>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ActiveGamePanel;
