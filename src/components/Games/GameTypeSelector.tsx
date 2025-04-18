/**
 * @summary Component for selecting game type during game creation
 * @author Augment Agent
 * @created 2023-07-10
 */

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  alpha,
  useTheme,
  Grid,
} from "@mui/material";
import {
  QuestionAnswer as QuestionAnswerIcon,
  Extension as ExtensionIcon,
  Casino as CasinoIcon,
  Lightbulb as LightbulbIcon,
  Psychology as PsychologyIcon,
} from "@mui/icons-material";

// Game template types
export const GAME_TEMPLATES = [
  {
    id: "trivia",
    name: "Trivia Quiz",
    icon: <QuestionAnswerIcon />,
    description: "Multiple-choice knowledge questions on various topics",
  },
  {
    id: "word",
    name: "Word Game",
    icon: <ExtensionIcon />,
    description: "Word-based games like scrambles, hangman, or word searches",
  },
  {
    id: "guess",
    name: "Guessing Game",
    icon: <CasinoIcon />,
    description: "Games where players guess numbers, words, or other items",
  },
  {
    id: "story",
    name: "Chat Story Quest",
    icon: <LightbulbIcon />,
    description: "Interactive story where viewers make choices",
  },
  {
    id: "puzzle",
    name: "Riddles & Puzzles",
    icon: <PsychologyIcon />,
    description: "Brain teasers, riddles, and logical puzzles to solve",
  },
];

interface GameTypeSelectorProps {
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
}

const GameTypeSelector: React.FC<GameTypeSelectorProps> = ({
  selectedTemplate,
  onSelectTemplate,
}) => {
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Select a Game Template
      </Typography>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {GAME_TEMPLATES.map((template) => (
          <Grid item xs={12} sm={6} key={template.id}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                cursor: "pointer",
                borderColor: selectedTemplate === template.id ? "primary.main" : "divider",
                bgcolor:
                  selectedTemplate === template.id ? alpha(theme.palette.primary.main, 0.05) : "transparent",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                },
              }}
              onClick={() => onSelectTemplate(template.id)}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: "primary.main",
                    width: 40,
                    height: 40,
                    mr: 2,
                  }}
                >
                  {template.icon}
                </Avatar>
                <Typography variant="subtitle1">{template.name}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {template.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default GameTypeSelector;
