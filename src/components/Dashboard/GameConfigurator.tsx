import React, { useState } from "react";
// import { TextField, Button, Box, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material'; // Example using MUI

// Placeholder for actual game config types
interface GuessTheNumberConfig {
  maxNumber: number;
}

const GameConfigurator: React.FC = () => {
  // Placeholder state - replace with actual logic later
  const [selectedGame, setSelectedGame] = useState<string>("guess-the-number");
  const [guessConfig, setGuessConfig] = useState<GuessTheNumberConfig>({
    maxNumber: 100,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const handleSave = async () => {
    setIsLoading(true);
    setStatusMessage("");
    console.log("Saving config for:", selectedGame, guessConfig);
    // TODO: Implement API call to save config
    // try {
    //   // await apiClient.post('/api/game/config', { gameId: selectedGame, config: guessConfig });
    //   setStatusMessage('Configuration saved successfully!');
    // } catch (error) {
    //   setStatusMessage('Failed to save configuration.');
    //   console.error(error);
    // } finally {
    //   setIsLoading(false);
    // }
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
    setStatusMessage("Placeholder: Config saved (simulated).");
    setIsLoading(false);
  };

  // TODO: Fetch current config on component mount

  return (
    // Using basic HTML elements for now, can be replaced with MUI later
    <div
      style={{
        border: "1px solid #ccc",
        padding: "15px",
        margin: "10px 0",
        borderRadius: "5px",
      }}
    >
      <h3>Game Management & Configuration</h3>

      {/* Game Selection (Placeholder for when multiple games exist) */}
      <div>
        <label htmlFor="game-select">Select Game: </label>
        <select
          id="game-select"
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value)}
          disabled // Disable until multiple games are available
        >
          <option value="guess-the-number">Guess the Number</option>
          {/* <option value="poll">Poll (Coming Soon)</option> */}
        </select>
      </div>
      <hr style={{ margin: "15px 0" }} />

      {/* Configuration for Selected Game */}
      {selectedGame === "guess-the-number" && (
        <div>
          <h4>Configure: Guess the Number</h4>
          <div>
            <label htmlFor="max-number">Max Number (1-1000): </label>
            <input
              type="number"
              id="max-number"
              value={guessConfig.maxNumber}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setGuessConfig({
                  maxNumber: isNaN(val) ? 1 : Math.max(1, Math.min(1000, val)),
                });
              }}
              min="1"
              max="1000"
              style={{ width: "80px" }}
            />
          </div>
          {/* Add more config options here */}
        </div>
      )}

      {/* Add config sections for other games here later */}

      <div style={{ marginTop: "15px" }}>
        <button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Game Config"}
        </button>
        {statusMessage && (
          <p
            style={{
              marginTop: "10px",
              color: statusMessage.startsWith("Failed") ? "red" : "green",
            }}
          >
            {statusMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default GameConfigurator;
