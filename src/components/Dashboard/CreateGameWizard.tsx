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
  Paper,
  Avatar,
  Divider,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  alpha,
} from "@mui/material";
import {
  QuestionAnswer as QuestionAnswerIcon,
  Extension as ExtensionIcon,
  Casino as CasinoIcon,
  Lightbulb as LightbulbIcon,
  Psychology as PsychologyIcon,
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

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
  const [customGameName, setCustomGameName] = useState<string>(""); // Store custom game name
  const [gameNameInput, setGameNameInput] = useState<string>(""); // Game name input in AI config step

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
      // Always go to AI config step, but pre-populate with built-in game details if selected
      if (selectedTemplateType === "builtin") {
        // Pre-populate the AI prompt with built-in game details
        const selectedGame = builtInTemplates.find(
          (game) => game.id === selectedBuiltInGame
        );
        if (selectedGame) {
          // Set a default prompt and game type hint based on the selected built-in game
          if (selectedBuiltInGame === "guess-the-number") {
            setAiPrompt(
              "Customize the Guess the Number game. You can change the number range, add themes, modify rules, or add special mechanics."
            );
            setAiTemplateHint("guess");
          }

          // Set a default game name suggestion
          setGameNameInput(`Custom ${selectedGame.name}`);
        }
      }
      setActiveStep((prev) => prev + 1); // Go to AI config step
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
            // For built-in templates, use a specific template type based on the game
            templateType:
              selectedTemplateType === "builtin"
                ? selectedBuiltInGame === "guess-the-number"
                  ? "guess"
                  : aiTemplateHint
                : aiTemplateHint,
            prompt: aiPrompt,
            // Include game name if provided
            ...(gameNameInput ? { gameName: gameNameInput } : {}),
            // If we're customizing a built-in game, include that information
            ...(selectedTemplateType === "builtin"
              ? {
                  ...(!gameNameInput
                    ? { gameName: `Custom ${selectedBuiltInGame}` }
                    : {}),
                  gameConfig: { baseTemplate: selectedBuiltInGame },
                }
              : {}),
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
        // Use the game name input if provided, otherwise use the generated name
        setCustomGameName(gameNameInput || generatedData.name); // Pre-populate the custom name field
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
        // If user customized the game name, update it before saving
        if (customGameName && customGameName !== generatedGamePreview.name) {
          const customizedGame = {
            ...generatedGamePreview,
            name: customGameName,
          };
          onGameCreated(customizedGame);
        } else {
          onGameCreated(generatedGamePreview);
        }
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
    setGameNameInput("");
    setCustomGameName("");
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
            <Box sx={{ position: "relative" }}>
              <TextField
                label="Game Name"
                value={gameNameInput}
                onChange={(e) => setGameNameInput(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                placeholder={
                  selectedTemplateType === "builtin"
                    ? `Custom ${selectedBuiltInGame}`
                    : "My Awesome Game"
                }
                helperText="Give your game a name (optional)"
              />
              <Box
                sx={{
                  position: "absolute",
                  right: 14,
                  top: 14,
                  pointerEvents: "none",
                }}
              >
                <EditIcon fontSize="small" color="action" />
              </Box>
            </Box>
            {/* Only show Game Type Hint for AI-generated games, not for built-in templates */}
            {selectedTemplateType !== "builtin" && (
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
            )}
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
              Preview and Customize
            </Typography>
            {generatedGamePreview ? (
              <>
                <Box sx={{ position: "relative", mb: 3 }}>
                  <TextField
                    label="Game Name"
                    value={customGameName || generatedGamePreview.name}
                    onChange={(e) => setCustomGameName(e.target.value)}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    helperText="Customize the name of your game"
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      right: 14,
                      top: 14,
                      pointerEvents: "none",
                    }}
                  >
                    <EditIcon fontSize="small" color="action" />
                  </Box>
                </Box>
                <GamePreviewCard
                  game={{
                    ...generatedGamePreview,
                    name: customGameName || generatedGamePreview.name,
                  }}
                />
              </>
            ) : (
              <Typography>No preview available.</Typography>
            )}
          </Box>
        );
      default:
        return "Unknown step";
    }
  };

  // Helper component for a more visually appealing game preview
  const GamePreviewCard = ({ game }: { game: any }) => {
    const theme = useTheme();

    // Get icon based on game type
    const getGameIcon = () => {
      const gameType = game.type || game.enhancedConfig?.gameType || "generic";

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

    return (
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2,
          mb: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.2),
              color: "primary.main",
              mr: 2,
            }}
          >
            {getGameIcon()}
          </Avatar>
          <Box>
            <Typography variant="h6">{game.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {game.type || game.enhancedConfig?.gameType || "Custom Game"}
            </Typography>
          </Box>
        </Box>

        <Typography variant="body1" sx={{ mb: 2 }}>
          {game.description}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Game Details
        </Typography>

        <Box sx={{ mt: 1 }}>
          {game.enhancedConfig && (
            <>
              {/* Show game rules if available */}
              {game.enhancedConfig.rules && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    color="primary.main"
                    gutterBottom
                  >
                    Rules
                  </Typography>
                  <Typography variant="body2">
                    {game.enhancedConfig.rules}
                  </Typography>
                </Box>
              )}

              {/* Show game settings if available */}
              {game.enhancedConfig.settings && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    color="primary.main"
                    gutterBottom
                  >
                    Settings
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: 1,
                    }}
                  >
                    {Object.entries(game.enhancedConfig.settings).map(
                      ([key, value]) => (
                        <Box key={key}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            component="div"
                          >
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </Typography>
                          <Typography variant="body2">
                            {String(value)}
                          </Typography>
                        </Box>
                      )
                    )}
                  </Box>
                </Box>
              )}

              {/* Show questions for trivia games */}
              {game.enhancedConfig.questions &&
                game.enhancedConfig.questions.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="primary.main"
                      gutterBottom
                    >
                      Sample Questions
                    </Typography>
                    <Box
                      sx={{
                        maxHeight: 150,
                        overflowY: "auto",
                        p: 1,
                        bgcolor: alpha(theme.palette.background.default, 0.5),
                        borderRadius: 1,
                      }}
                    >
                      {game.enhancedConfig.questions
                        .slice(0, 3)
                        .map((q: any, i: number) => (
                          <Box key={i} sx={{ mb: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              Q{i + 1}: {q.question}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              A:{" "}
                              {q.answer ||
                                (q.options && q.options[q.correctOption])}
                            </Typography>
                          </Box>
                        ))}
                      {game.enhancedConfig.questions.length > 3 && (
                        <Typography variant="caption" color="text.secondary">
                          +{game.enhancedConfig.questions.length - 3} more
                          questions
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}

              {/* Show word bank for word games */}
              {game.enhancedConfig.wordBank &&
                game.enhancedConfig.wordBank.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="primary.main"
                      gutterBottom
                    >
                      Word Bank
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {game.enhancedConfig.wordBank
                        .slice(0, 10)
                        .map((word: string, i: number) => (
                          <Chip
                            key={i}
                            label={word}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      {game.enhancedConfig.wordBank.length > 10 && (
                        <Chip
                          label={`+${
                            game.enhancedConfig.wordBank.length - 10
                          } more`}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      )}
                    </Box>
                  </Box>
                )}
            </>
          )}

          {/* Advanced details toggle */}
          <Accordion sx={{ mt: 2, bgcolor: "transparent" }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2">Advanced Details</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  whiteSpace: "pre-wrap",
                  maxHeight: 200,
                  overflowY: "auto",
                  p: 1,
                  bgcolor: alpha(theme.palette.grey[900], 0.05),
                  borderRadius: 1,
                }}
              >
                {JSON.stringify(game, null, 2)}
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Paper>
    );
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
        {selectedTemplateType === "builtin" && activeStep === 1 && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: "info.light",
              borderRadius: 1,
              color: "info.contrastText",
            }}
          >
            <Typography variant="body2">
              You're customizing the built-in "{selectedBuiltInGame}" template.
              Describe how you want to modify it, and the AI will generate a
              customized version.
            </Typography>
          </Box>
        )}
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
