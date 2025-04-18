/**
 * @summary Component for previewing a generated game before saving
 * @author Augment Agent
 * @created 2023-07-10
 */

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Divider,
  Grid,
  alpha,
  useTheme,
  CircularProgress,
  Chip,
  Stack,
  Button,
} from "@mui/material";
import {
  Check as CheckIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Extension as ExtensionIcon,
  Casino as CasinoIcon,
  Lightbulb as LightbulbIcon,
  Psychology as PsychologyIcon,
} from "@mui/icons-material";
import { GAME_TEMPLATES } from "./GameTypeSelector";

interface GamePreviewProps {
  isGenerating: boolean;
  generatedGame: any;
  gameType: string;
}

const GamePreview: React.FC<GamePreviewProps> = ({
  isGenerating,
  generatedGame,
  gameType,
}) => {
  const theme = useTheme();

  // Get icon based on game type
  const getGameIcon = () => {
    if (!gameType) return <CasinoIcon />;

    const template = GAME_TEMPLATES.find((t) => t.id === gameType);
    if (template) return template.icon;

    switch (gameType) {
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
        return <CasinoIcon />;
    }
  };

  // Get template name based on game type
  const getGameTypeName = () => {
    if (!gameType) return "Game";

    const template = GAME_TEMPLATES.find((t) => t.id === gameType);
    return template
      ? template.name
      : gameType.charAt(0).toUpperCase() + gameType.slice(1);
  };

  if (isGenerating) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: 300,
        }}
      >
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h6" gutterBottom>
          Generating Your Game
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          Our AI is creating a custom {getGameTypeName()} game for you.
          <br />
          This may take a few moments...
        </Typography>
      </Box>
    );
  }

  if (!generatedGame) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: 300,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No game generated yet. Please go back and complete the previous steps.
        </Typography>
      </Box>
    );
  }

  // Render preview based on game type
  const renderGameTypePreview = () => {
    if (gameType === "trivia" && generatedGame.enhancedConfig?.questions) {
      return (
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Sample Questions ({generatedGame.enhancedConfig.questions.length}{" "}
            total):
          </Typography>

          <Stack spacing={2} sx={{ mt: 2 }}>
            {generatedGame.enhancedConfig.questions
              .slice(0, 3)
              .map((question: any, index: number) => (
                <Paper
                  key={index}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    {index + 1}. {question.question}
                  </Typography>
                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    {question.options.map(
                      (option: string, optIndex: number) => (
                        <Grid item xs={6} key={optIndex}>
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 1,
                              border: "1px solid",
                              borderColor:
                                optIndex === question.answer
                                  ? "success.main"
                                  : "divider",
                              bgcolor:
                                optIndex === question.answer
                                  ? alpha(theme.palette.success.main, 0.1)
                                  : "transparent",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {optIndex === question.answer && (
                              <CheckIcon
                                fontSize="small"
                                sx={{ color: "success.main", mr: 1 }}
                              />
                            )}
                            <Typography variant="body2">{option}</Typography>
                          </Box>
                        </Grid>
                      )
                    )}
                  </Grid>
                </Paper>
              ))}

            {generatedGame.enhancedConfig.questions.length > 3 && (
              <Typography variant="body2" color="text.secondary" align="center">
                + {generatedGame.enhancedConfig.questions.length - 3} more
                questions
              </Typography>
            )}
          </Stack>
        </Box>
      );
    }

    if (gameType === "word" && generatedGame.enhancedConfig?.wordBank) {
      return (
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Word Bank Sample:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
            {generatedGame.enhancedConfig.wordBank
              .slice(0, 10)
              .map((word: string, index: number) => (
                <Chip key={index} label={word} variant="outlined" />
              ))}
            {generatedGame.enhancedConfig.wordBank.length > 10 && (
              <Chip
                label={`+${
                  generatedGame.enhancedConfig.wordBank.length - 10
                } more`}
                variant="outlined"
                color="primary"
              />
            )}
          </Box>
        </Box>
      );
    }

    // Default preview for other game types
    return (
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Game Rules:
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
          <Typography variant="body2">
            {generatedGame.enhancedConfig?.rules ||
              "Game rules will be provided when the game starts."}
          </Typography>
        </Paper>
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Generated Game Preview
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: 2,
          mb: 3,
          bgcolor: alpha(theme.palette.success.main, 0.05),
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
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
          <Box>
            <Typography variant="h6">{generatedGame.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {getGameTypeName()}
            </Typography>
          </Box>
        </Box>

        <Typography variant="body1" paragraph>
          {generatedGame.description}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Game Content Preview
        </Typography>

        {renderGameTypePreview()}

        <Divider sx={{ my: 2 }} />

        {generatedGame.enhancedConfig?.settings && (
          <>
            <Typography variant="subtitle2" gutterBottom>
              Game Settings
            </Typography>

            <Grid container spacing={2}>
              {Object.entries(generatedGame.enhancedConfig.settings).map(
                ([key, value]) => (
                  <Grid item xs={6} sm={3} key={key}>
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
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {typeof value === "boolean"
                          ? value
                            ? "Yes"
                            : "No"
                          : value}
                      </Typography>
                    </Paper>
                  </Grid>
                )
              )}
            </Grid>
          </>
        )}

        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.warning.main, 0.1),
            border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
          }}
        >
          <Typography variant="subtitle2" color="warning.dark" gutterBottom>
            Important Note
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You can edit this game after creation from the Games page. If you're
            not satisfied with the result, you can go back and modify your
            prompt to generate a different game.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default GamePreview;
