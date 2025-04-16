import React, { useState } from "react";

const BotConfigurator: React.FC = () => {
  // Placeholder state
  const [commandPrefix, setCommandPrefix] = useState<string>("!");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const handleSave = async () => {
    setIsLoading(true);
    setStatusMessage("");
    console.log("Saving bot config:", { commandPrefix });
    // TODO: Implement API call to save bot config
    // try {
    //   // await apiClient.post('/api/bot/config', { prefix: commandPrefix });
    //   setStatusMessage('Bot configuration saved successfully!');
    // } catch (error) {
    //   setStatusMessage('Failed to save bot configuration.');
    //   console.error(error);
    // } finally {
    //   setIsLoading(false);
    // }
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
    setStatusMessage("Placeholder: Bot config saved (simulated).");
    setIsLoading(false);
  };

  // TODO: Fetch current config on component mount

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "15px",
        margin: "10px 0",
        borderRadius: "5px",
      }}
    >
      <h3>Bot Configuration</h3>
      <div>
        <label htmlFor="command-prefix">Command Prefix: </label>
        <input
          type="text"
          id="command-prefix"
          value={commandPrefix}
          onChange={(e) => setCommandPrefix(e.target.value)}
          maxLength={5} // Limit prefix length
          style={{ width: "50px" }}
        />
      </div>
      {/* Add more bot config options here later */}
      <div style={{ marginTop: "15px" }}>
        <button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Bot Config"}
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

export default BotConfigurator;
