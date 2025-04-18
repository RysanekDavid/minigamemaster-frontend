// frontend/src/components/Dashboard/CreateGameWizard.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";

interface CreateGameWizardProps {
  open: boolean;
  onClose: () => void;
  onGameCreated?: (gameDefinition: any) => void;
  // TODO: Pass available built-in game templates
  // builtInTemplates: { id: string; name: string }[];
}

const steps = ["Select Template", "Configure AI (Optional)", "Preview & Save"];

export const CreateGameWizard: React.FC<CreateGameWizardProps> = ({
  open,
  onClose,
  onGameCreated,
  // builtInTemplates = [], // Default to empty array
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTemplateType, setSelectedTemplateType] = useState<string>(""); // 'builtin' or 'ai'
  const [selectedBuiltInGame, setSelectedBuiltInGame] = useState<string>("");
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [aiTemplateHint, setAiTemplateHint] = useState<string>("quiz"); // Default hint
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedGamePreview, setGeneratedGamePreview] = useState<any>(null); // Store AI response

  // --- Mock Data ---
  // Replace with props later
  const builtInTemplates = [
    { id: "guess-the-number", name: "Guess the Number" },
  ];
  // --- End Mock Data ---

  const handleNext = async () => {
    setError(null); // Clear previous errors
    if (activeStep === 0) {
      // Moving from Select Template
      if (!selectedTemplateType) {
        setError("Please select a template type.");
        return;
      }
      if (selectedTemplateType === "builtin" && !selectedBuiltInGame) {
        setError("Please select a built-in game.");
        return;
      }
      if (selectedTemplateType === "ai") {
        setActiveStep((prev) => prev + 1); // Go to AI config step
      } else {
        // Skip AI config step for built-in games
        // TODO: Potentially load config UI for built-in here? For now, just skip to end.
        setActiveStep(steps.length - 1); // Go directly to Preview/Save (or final step)
      }
    } else if (activeStep === 1) {
      // Moving from Configure AI
      if (!aiPrompt.trim()) {
        setError("Please enter a prompt for the AI.");
        return;
      }
      // --- Call AI Generation API ---
      setIsLoading(true);
      try {
        const response = await fetch("/api/games/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateType: aiTemplateHint,
            prompt: aiPrompt,
          }),
          credentials: "include",
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `AI generation failed: ${response.status} ${
              response.statusText
            } - ${errorData.message || "Unknown error"}`
          );
        }
        const generatedData = await response.json();
        setGeneratedGamePreview(generatedData); // Store the preview data
        setActiveStep((prev) => prev + 1); // Move to Preview step
      } catch (err) {
        console.error("AI Generation Error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to generate game from AI."
        );
      } finally {
        setIsLoading(false);
      }
      // --- End AI Generation API Call ---
    } else if (activeStep === steps.length - 1) {
      // Final step (Save)
      console.log(
        "Save clicked. Data:",
        generatedGamePreview || selectedBuiltInGame
      );

      // The game is already saved in the backend during generation
      // Just notify the parent component about the new game
      if (onGameCreated && generatedGamePreview) {
        onGameCreated(generatedGamePreview);
      }

      handleClose(); // Close wizard on successful save
    }
  };

  const handleBack = () => {
    setError(null);
    if (activeStep === 2 && selectedTemplateType === "builtin") {
      // If skipping AI step, go back to step 0
      setActiveStep(0);
    } else {
      setActiveStep((prev) => prev - 1);
    }
    setGeneratedGamePreview(null); // Clear preview when going back
  };

  const handleClose = () => {
    setActiveStep(0);
    setSelectedTemplateType("");
    setSelectedBuiltInGame("");
    setAiPrompt("");
    setAiTemplateHint("quiz");
    setGeneratedGamePreview(null);
    setError(null);
    setIsLoading(false);
    onClose();
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Select Template
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              minWidth: 400,
            }}
          >
            <FormControl
              fullWidth
              required
              error={!!error && !selectedTemplateType}
            >
              <InputLabel id="template-type-select-label">
                Template Type
              </InputLabel>
              <Select
                labelId="template-type-select-label"
                value={selectedTemplateType}
                label="Template Type *"
                onChange={(e) => setSelectedTemplateType(e.target.value)}
              >
                <MenuItem value="builtin">Use Built-in Template</MenuItem>
                <MenuItem value="ai">AI-Generate Your Own</MenuItem>
              </Select>
            </FormControl>
            {selectedTemplateType === "builtin" && (
              <FormControl
                fullWidth
                required
                error={!!error && !selectedBuiltInGame}
              >
                <InputLabel id="builtin-game-select-label">
                  Built-in Game
                </InputLabel>
                <Select
                  labelId="builtin-game-select-label"
                  value={selectedBuiltInGame}
                  label="Built-in Game *"
                  onChange={(e) => setSelectedBuiltInGame(e.target.value)}
                >
                  {builtInTemplates.map((template) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.name}
                    </MenuItem>
                  ))}
                  {/* Add more built-in games here */}
                </Select>
              </FormControl>
            )}
          </Box>
        );
      case 1: // Configure AI
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              minWidth: 400,
            }}
          >
            <FormControl fullWidth>
              <InputLabel id="ai-template-hint-label">
                Game Type Hint
              </InputLabel>
              <Select
                labelId="ai-template-hint-label"
                value={aiTemplateHint}
                label="Game Type Hint"
                onChange={(e) => setAiTemplateHint(e.target.value)}
              >
                {/* Add more relevant hints */}
                <MenuItem value="quiz">Quiz/Trivia</MenuItem>
                <MenuItem value="story">Interactive Story</MenuItem>
                <MenuItem value="puzzle">Puzzle/Word Game</MenuItem>
                <MenuItem value="chance">Game of Chance</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Describe the game you want to create"
              multiline
              rows={6}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              fullWidth
              required
              error={!!error && !aiPrompt.trim()}
              helperText="Be descriptive! Include rules, theme, win conditions, etc."
            />
          </Box>
        );
      case 2: // Preview & Save
        return (
          <Box sx={{ minWidth: 400 }}>
            <Typography variant="h6" gutterBottom>
              Preview
            </Typography>
            {selectedTemplateType === "builtin" ? (
              <Typography>
                Selected Built-in Game: {selectedBuiltInGame}
              </Typography>
            ) : // TODO: Show config options for built-in game here?
            generatedGamePreview ? (
              <Box
                sx={{
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                  maxHeight: 300,
                  overflowY: "auto",
                  border: "1px solid grey",
                  p: 1,
                  borderRadius: 1,
                }}
              >
                {JSON.stringify(generatedGamePreview, null, 2)}
              </Box>
            ) : (
              <Typography>No preview available.</Typography>
            )}
            {/* TODO: Add ability to edit the generated preview? */}
          </Box>
        );
      default:
        return "Unknown step";
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Game</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label, index) => (
            <Step key={label} completed={activeStep > index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box
          sx={{
            mt: 2,
            mb: 1,
            minHeight: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isLoading ? <CircularProgress /> : renderStepContent(activeStep)}
        </Box>
        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            Error: {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Box sx={{ flex: "1 1 auto" }} />
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={
            isLoading ||
            (activeStep === 0 && !selectedTemplateType) ||
            (activeStep === 0 &&
              selectedTemplateType === "builtin" &&
              !selectedBuiltInGame) ||
            (activeStep === 1 && !aiPrompt.trim())
          }
        >
          {activeStep === steps.length - 1 ? "Save Game" : "Next"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
