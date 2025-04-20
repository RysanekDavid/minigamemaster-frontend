/**
 * @summary API service for game-related operations
 * @author Augment Agent
 * @created 2023-07-10
 */

// Types for API requests and responses
export interface GameDefinition {
  id: string;
  definitionId?: string; // Some games might use definitionId instead of id
  name: string;
  description: string;
  type: string;
  createdAt: string;
  lastPlayed?: string;
  configSchema: Record<string, any>;
  enhancedConfig?: Record<string, any>;
}

export interface GenerateGameRequest {
  templateType: string;
  prompt: string;
  gameName?: string;
  gameConfig?: Record<string, any>;
}

export interface GameStatus {
  isActive: boolean;
  name?: string;
  gameId?: string;
  currentState?: any;
  error?: string;
}

// Game API service
const GameApiService = {
  // Fetch all game definitions for the current user
  async getGameDefinitions(): Promise<GameDefinition[]> {
    try {
      const response = await fetch("/api/games/definitions", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch game definitions: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching game definitions:", error);
      throw error;
    }
  },

  // Generate a new game
  async generateGame(request: GenerateGameRequest): Promise<GameDefinition> {
    try {
      const response = await fetch("/api/games/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `AI generation failed: ${response.status} ${response.statusText} - ${
            errorData.message || "Unknown error"
          }`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error generating game:", error);
      throw error;
    }
  },

  // Start a game
  async startGame(gameId: string, options: any = {}): Promise<void> {
    try {
      const response = await fetch("/api/games/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, options }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Start game failed" }));
        throw new Error(
          `Failed to start game: ${errorData.message || response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error starting game:", error);
      throw error;
    }
  },

  // Stop the current game
  async stopGame(): Promise<void> {
    try {
      const response = await fetch("/api/games/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Stop game failed" }));
        throw new Error(
          `Failed to stop game: ${errorData.message || response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error stopping game:", error);
      throw error;
    }
  },

  // Get current game status
  async getGameStatus(): Promise<GameStatus> {
    try {
      const response = await fetch("/api/games/status", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { isActive: false };
        }
        throw new Error(`Failed to fetch game status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching game status:", error);
      return {
        isActive: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  // Delete a game definition
  async deleteGameDefinition(definitionId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/games/definitions/${definitionId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to delete game definition: ${response.statusText}`
        );
      }

      return true;
    } catch (error) {
      console.error("Error deleting game definition:", error);
      throw error;
    }
  },

  // Update game configuration
  async updateGameConfig(gameId: string, config: any): Promise<void> {
    try {
      const response = await fetch("/api/games/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId,
          config,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to update game configuration: ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error updating game configuration:", error);
      throw error;
    }
  },

  // Update game definition (name, description, settings, etc.)
  async updateGameDefinition(
    gameId: string,
    gameData: Partial<GameDefinition>
  ): Promise<GameDefinition> {
    try {
      const response = await fetch(`/api/games/definitions/${gameId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gameData),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to update game definition: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating game definition:", error);
      throw error;
    }
  },

  // Get game configuration
  async getGameConfig(gameId: string): Promise<any> {
    try {
      const response = await fetch(`/api/games/config/${gameId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch game configuration: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching game configuration:", error);
      throw error;
    }
  },
};

export default GameApiService;
