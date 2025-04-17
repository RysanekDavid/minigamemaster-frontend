import React, { useState } from "react";
// import { TextField, Button, Box, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material'; // Example using MUI

// Placeholder for actual game config types
interface GuessTheNumberConfig {
  minNumber: number;
  maxNumber: number;
  autoStartEnabled?: boolean; // Add autoStartEnabled
  autoStartIntervalMinutes?: number; // Add autoStartIntervalMinutes
}

const GameConfigurator: React.FC = () => {
  // Placeholder state - replace with actual logic later
  const [selectedGame, setSelectedGame] = useState<string>("guess-the-number");
  const [guessConfig, setGuessConfig] = useState<GuessTheNumberConfig>({
    minNumber: 1,
    maxNumber: 100,
    autoStartEnabled: false, // Default autoStart to false
    autoStartIntervalMinutes: 15, // Default interval to 15 minutes
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const handleSave = async () => {
    setIsLoading(true);
    setStatusMessage("");
    console.log("Saving config for:", selectedGame, guessConfig);

    try {
      // Use fetch API to send the config to the backend
      const response = await fetch("/api/games/config", {
        // Assuming API is served from the same origin
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add authentication headers if needed (e.g., Authorization: Bearer token)
        },
        body: JSON.stringify({
          gameId: selectedGame,
          config: guessConfig,
        }),
      });

      if (!response.ok) {
        // Handle non-successful responses (e.g., 4xx, 5xx)
        const errorData = await response.json().catch(() => ({})); // Try to parse error JSON
        setStatusMessage(
          `Failed to save configuration: ${response.status} ${
            response.statusText
          } - ${errorData.message || "Unknown error"}`
        );
        console.error("Failed response:", response);
      } else {
        const result = await response.json();
        setStatusMessage(result.message || "Configuration saved successfully!");
      }
    } catch (error: any) {
      // Catch network errors or other issues
      setStatusMessage(
        `Failed to save configuration: ${error.message || "Network error"}`
      );
      console.error(error); // Log the actual error
    } finally {
      setIsLoading(false); // Ensure loading state is reset
    }
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
          <div style={{ marginBottom: "10px" }}>
            {" "}
            {/* Add margin */}
            <label htmlFor="min-number">Min Number (1-999): </label>
            <input
              type="number"
              id="min-number"
              value={guessConfig.minNumber}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                const newMin = isNaN(val) ? 1 : Math.max(1, Math.min(999, val));
                // Ensure min is always less than max
                setGuessConfig({
                  ...guessConfig,
                  minNumber: newMin,
                  maxNumber: Math.max(newMin + 1, guessConfig.maxNumber), // Adjust max if needed
                });
              }}
              min="1"
              max="999" // Max should be less than maxNumber's max
              style={{ width: "80px" }}
            />
          </div>
          <div>
            <label htmlFor="max-number">
              Max Number ({guessConfig.minNumber + 1}-1000):{" "}
            </label>{" "}
            {/* Dynamic label */}
            <input
              type="number"
              id="max-number"
              value={guessConfig.maxNumber}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                // Ensure max is always greater than min
                const newMax = isNaN(val)
                  ? guessConfig.minNumber + 1
                  : Math.max(guessConfig.minNumber + 1, Math.min(1000, val));
                setGuessConfig({
                  ...guessConfig,
                  maxNumber: newMax,
                });
              }}
              min={guessConfig.minNumber + 1} // Dynamic min based on minNumber
              max="1000"
              style={{ width: "80px" }}
            />
          </div>
          {/* --- Add Auto-Start Config --- */}
          <hr style={{ margin: "15px 0" }} />
          <h5>Automatic Start</h5>
          <div
            style={{
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <input
              type="checkbox"
              id="auto-start-enabled"
              checked={guessConfig.autoStartEnabled ?? false}
              onChange={(e) =>
                setGuessConfig({
                  ...guessConfig,
                  autoStartEnabled: e.target.checked,
                })
              }
              style={{ marginRight: "8px" }}
            />
            <label htmlFor="auto-start-enabled">
              Enable Automatic Game Start
            </label>
          </div>
          {guessConfig.autoStartEnabled && (
            <div>
              <label htmlFor="auto-start-interval">
                Start Interval (minutes, 5-1440):{" "}
              </label>
              <input
                type="number"
                id="auto-start-interval"
                value={guessConfig.autoStartIntervalMinutes ?? 15}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setGuessConfig({
                    ...guessConfig,
                    autoStartIntervalMinutes: isNaN(val)
                      ? 5
                      : Math.max(5, Math.min(1440, val)), // Min 5 min, Max 1 day
                  });
                }}
                min="5"
                max="1440"
                style={{ width: "80px" }}
                disabled={!guessConfig.autoStartEnabled} // Disable if auto-start is off
              />
            </div>
          )}
          {/* --- End Auto-Start Config --- */}
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
