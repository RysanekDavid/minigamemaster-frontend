/**
 * @summary Component for configuring game-specific settings during creation
 * @author Augment Agent
 * @created 2023-07-10
 */

import React from "react";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
  Slider,
  FormControlLabel,
  Checkbox,
  Chip,
  IconButton,
  InputAdornment,
  useTheme,
  alpha,
} from "@mui/material";
import { Info as InfoIcon, Add as AddIcon } from "@mui/icons-material";

// AI models
export const AI_MODELS = [
  {
    id: "deepseek",
    name: "DeepSeek (Recommended)",
    description: "Good balance between quality and generation speed",
  },
  { 
    id: "fast-model", 
    name: "Fast Model (Economy)", 
    description: "Quick generation with simpler content" 
  },
];

interface GameFormConfigProps {
  gameType: string;
  aiModel: string;
  prompt: string;
  onAiModelChange: (model: string) => void;
  onPromptChange: (prompt: string) => void;
}

const GameFormConfig: React.FC<GameFormConfigProps> = ({
  gameType,
  aiModel,
  prompt,
  onAiModelChange,
  onPromptChange,
}) => {
  const theme = useTheme();

  // Get placeholder text based on game type
  const getPlaceholderText = () => {
    switch (gameType) {
      case "trivia":
        return "Create a trivia game about [topic]. Include questions about [specific aspects]. Make it [difficulty level] difficulty.";
      case "word":
        return "Create a word game where players [game objective]. Use words related to [topic/theme]. Include special rules like [special rule].";
      case "guess":
        return "Create a guessing game where players try to guess [what to guess]. Include hints about [hint topics]. Make it challenging but fair.";
      case "story":
        return "Create an interactive story set in [setting/world]. The main character is [character description]. Players will help decide [decision points].";
      case "puzzle":
        return "Create a puzzle game with [puzzle type] puzzles. The theme should be [theme]. Include a variety of difficulty levels.";
      default:
        return "Describe the game you want to create in detail. Include rules, theme, win conditions, etc.";
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Configure AI Generation
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2,
          mb: 3,
          bgcolor: alpha(theme.palette.info.main, 0.05),
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <InfoIcon fontSize="small" sx={{ color: "info.main", mr: 1 }} />
          <Typography variant="body2" color="info.main">
            The AI will generate a complete {gameType} game based on your prompt.
          </Typography>
        </Box>
      </Paper>

      <Typography variant="subtitle2" gutterBottom>
        Select AI Model
      </Typography>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <Select
          value={aiModel}
          onChange={(e) => onAiModelChange(e.target.value)}
          size="small"
        >
          {AI_MODELS.map((model) => (
            <MenuItem key={model.id} value={model.id}>
              <Box>
                <Typography variant="body2">{model.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {model.description}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography variant="subtitle2" gutterBottom>
        Game Prompt
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={4}
        placeholder={getPlaceholderText()}
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        variant="outlined"
        sx={{ mb: 2 }}
      />

      <Typography variant="caption" color="text.secondary">
        Be specific about the game rules, theme, and any special mechanics you want.
      </Typography>

      {/* Game-specific configuration options could be added here based on gameType */}
    </Box>
  );
};

export default GameFormConfig;
