/**
 * @summary Component for displaying a game card in the game library
 * @author Augment Agent
 * @created 2023-07-10
 */

import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Avatar,
  Chip,
  Paper,
  IconButton,
  Button,
  Tooltip,
  alpha,
  useTheme,
  Grid,
} from "@mui/material";
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  AutoFixHigh as AIIcon,
  SportsEsports as GameControllerIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Extension as ExtensionIcon,
  Casino as CasinoIcon,
  Lightbulb as LightbulbIcon,
  Psychology as PsychologyIcon,
} from "@mui/icons-material";
import { GAME_TEMPLATES } from "./GameTypeSelector";

interface GameCardProps {
  game: {
    id: string;
    name: string;
    type: string;
    description: string;
    createdAt: string;
    lastPlayed?: string;
    status: "active" | "inactive";
    plays: number;
    players: number;
    aiGenerated: boolean;
  };
  onStartGame: (gameId: string) => void;
  onStopGame: () => void;
  onDeleteGame: (gameId: string) => void;
  onDuplicateGame?: (gameId: string) => void;
}

const GameCard: React.FC<GameCardProps> = ({
  game,
  onStartGame,
  onStopGame,
  onDeleteGame,
  onDuplicateGame,
}) => {
  const theme = useTheme();
  const isActive = game.status === "active";

  // Get icon based on game type
  const getGameIcon = () => {
    if (!game || !game.type) return <GameControllerIcon />;

    const template = GAME_TEMPLATES.find((t) => t.id === game.type);
    if (template) return template.icon;

    switch (game.type) {
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
    if (!game || !game.type) return "Game";

    const template = GAME_TEMPLATES.find((t) => t.id === game.type);
    return template
      ? template.name
      : game.type.charAt(0).toUpperCase() + game.type.slice(1);
  };

  return (
    <Card sx={{ height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 3,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Avatar
          sx={{
            bgcolor: alpha(theme.palette.secondary.main, 0.1),
            color: "secondary.main",
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
              {game.name}
            </Typography>
            {game.aiGenerated === true && (
              <Tooltip title="AI Generated">
                <AIIcon
                  fontSize="small"
                  sx={{ ml: 1, color: theme.palette.primary.main }}
                />
              </Tooltip>
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {getGameTypeName()}
          </Typography>
        </Box>
        {isActive && (
          <Chip
            label="Active"
            size="small"
            color="success"
            sx={{
              fontWeight: "medium",
              "& .MuiChip-label": { px: 1 },
            }}
          />
        )}
      </Box>

      <CardContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {game.description}
        </Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                borderRadius: 2,
                textAlign: "center",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Total Plays
              </Typography>
              <Typography variant="h6" color="text.primary">
                {game.plays}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                borderRadius: 2,
                textAlign: "center",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Total Players
              </Typography>
              <Typography variant="h6" color="text.primary">
                {game.players}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Created: {new Date(game.createdAt).toLocaleDateString()}
          </Typography>
          {game.lastPlayed && (
            <Typography variant="caption" color="text.secondary">
              Last played: {new Date(game.lastPlayed).toLocaleDateString()}
            </Typography>
          )}
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: "space-between", p: 2, pt: 0 }}>
        <Box>
          <Tooltip title="Delete Game">
            <IconButton
              size="small"
              color="default"
              onClick={() => onDeleteGame(game.id)}
              sx={{ mr: 1 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {onDuplicateGame && (
            <Tooltip title="Duplicate Game">
              <IconButton
                size="small"
                color="default"
                onClick={() => onDuplicateGame(game.id)}
                sx={{ mr: 1 }}
              >
                <DuplicateIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {isActive ? (
          <Button
            variant="outlined"
            color="error"
            onClick={onStopGame}
            startIcon={<StopIcon />}
          >
            Stop Game
          </Button>
        ) : (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => onStartGame(game.id)}
            startIcon={<PlayIcon />}
          >
            Start Game
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default GameCard;
