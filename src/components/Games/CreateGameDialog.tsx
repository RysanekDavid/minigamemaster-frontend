/**
 * @summary Dialog component for creating new games
 * @author Augment Agent
 * @created 2023-07-10
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Typography,
} from "@mui/material";
import {
  Close as CloseIcon,
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import GameTypeSelector from "./GameTypeSelector";
import GameFormConfig from "./GameFormConfig";
import GamePreview from "./GamePreview";
import GameApiService, { GenerateGameRequest } from "../../services/gameApi";

interface CreateGameDialogProps {
  open: boolean;
  onClose: () => void;
  onGameCreated: (game: any) => void;
}

const CreateGameDialog: React.FC<CreateGameDialogProps> = ({
  open,
  onClose,
  onGameCreated,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedAIModel, setSelectedAIModel] = useState("deepseek");
  const [gamePrompt, setGamePrompt] = useState("");
  const [generatedGame, setGeneratedGame] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = ["Select Template", "Configure AI", "Preview & Save"];

  const handleClose = () => {
    setActiveStep(0);
    setSelectedTemplate("");
    setSelectedAIModel("deepseek");
    setGamePrompt("");
    setGeneratedGame(null);
    setIsGenerating(false);
    setError(null);
    onClose();
  };

  const handleNextStep = async () => {
    setError(null);

    if (activeStep === 0) {
      if (!selectedTemplate) {
        setError("Please select a game template");
        return;
      }
      setActiveStep(1);
    } else if (activeStep === 1) {
      if (!gamePrompt.trim()) {
        setError("Please enter a game prompt");
        return;
      }

      // Call API to generate game
      setIsGenerating(true);
      try {
        const request: GenerateGameRequest = {
          templateType: selectedTemplate,
          prompt: gamePrompt,
        };

        try {
          const generatedGameData = await GameApiService.generateGame(request);
          setGeneratedGame(generatedGameData);
        } catch (err) {
          console.error("API Error generating game:", err);
          // Use mock data for demonstration if API fails
          const mockGame = {
            id: `ai-${selectedTemplate}-${Math.floor(Math.random() * 1000)}`,
            name:
              selectedTemplate === "trivia"
                ? "Knowledge Quiz"
                : selectedTemplate === "word"
                ? "Word Challenge"
                : selectedTemplate === "guess"
                ? "Number Guessing Game"
                : selectedTemplate === "story"
                ? "Adventure Quest"
                : "Brain Teaser",
            description: `A ${selectedTemplate} game created based on your prompt: ${gamePrompt.substring(
              0,
              50
            )}...`,
            type: selectedTemplate,
            createdAt: new Date().toISOString(),
            configSchema: {},
            enhancedConfig:
              selectedTemplate === "trivia"
                ? {
                    questions: [
                      {
                        question: "What is the capital of France?",
                        options: ["Paris", "London", "Berlin", "Madrid"],
                        answer: 0,
                      },
                      {
                        question: "Which planet is known as the Red Planet?",
                        options: ["Venus", "Mars", "Jupiter", "Saturn"],
                        answer: 1,
                      },
                    ],
                    settings: {
                      timePerQuestion: 30,
                      pointsPerCorrectAnswer: 100,
                      bonusForFastAnswers: true,
                    },
                  }
                : selectedTemplate === "word"
                ? {
                    wordBank: [
                      "javascript",
                      "react",
                      "typescript",
                      "component",
                      "interface",
                    ],
                    rules: "Unscramble the words to earn points!",
                    settings: {
                      timeLimit: 60,
                      difficulty: "Medium",
                    },
                  }
                : {
                    rules: "Follow the game instructions to win!",
                    settings: {
                      difficulty: "Medium",
                      timeLimit: 300,
                    },
                  },
          };
          setGeneratedGame(mockGame);
        }
        setActiveStep(2);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to generate game"
        );
        console.error("Error in handleNextStep:", err);
      } finally {
        setIsGenerating(false);
      }
    } else if (activeStep === 2) {
      // Save the game (it's already saved on the backend)
      if (generatedGame) {
        onGameCreated(generatedGame);
        handleClose();
      }
    }
  };

  const handleBackStep = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          Create New Game
          <IconButton onClick={handleClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <Box sx={{ px: 3, pt: 1, pb: 2 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <DialogContent sx={{ minHeight: 400 }}>
        {activeStep === 0 && (
          <GameTypeSelector
            selectedTemplate={selectedTemplate}
            onSelectTemplate={setSelectedTemplate}
          />
        )}

        {activeStep === 1 && (
          <GameFormConfig
            gameType={selectedTemplate}
            aiModel={selectedAIModel}
            prompt={gamePrompt}
            onAiModelChange={setSelectedAIModel}
            onPromptChange={setGamePrompt}
          />
        )}

        {activeStep === 2 && (
          <GamePreview
            isGenerating={isGenerating}
            generatedGame={generatedGame}
            gameType={selectedTemplate}
          />
        )}

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            Error: {error}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        {activeStep > 0 && (
          <Button onClick={handleBackStep} startIcon={<BackIcon />}>
            Back
          </Button>
        )}
        {activeStep < 2 ? (
          <Button
            onClick={handleNextStep}
            variant="contained"
            color="primary"
            endIcon={<NextIcon />}
            disabled={
              isGenerating ||
              (activeStep === 0 && !selectedTemplate) ||
              (activeStep === 1 && !gamePrompt.trim())
            }
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleNextStep}
            variant="contained"
            color="primary"
            endIcon={<SaveIcon />}
            disabled={isGenerating || !generatedGame}
          >
            Save Game
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateGameDialog;
