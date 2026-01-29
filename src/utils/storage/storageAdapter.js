/**
 * Storage Adapter Interface
 * 
 * Abstract base class defining the interface for game storage adapters.
 * All storage implementations (localStorage, Supabase, etc.) must implement this interface.
 * 
 * This abstraction allows the game manager to work with different storage backends
 * without changing its core logic.
 */

/**
 * @typedef {Object} SaveGameResult
 * @property {boolean} success - Whether the save was successful
 * @property {boolean} [conflict] - Whether there was a conflict (cloud adapters only)
 * @property {string} [lastModified] - The last modified timestamp (cloud adapters only)
 */

/**
 * Base StorageAdapter class
 * 
 * All storage adapters must implement these methods:
 * - saveGame(code, state, metadata): Save game state
 * - loadGame(code): Load game state
 * - deleteGame(code): Delete a game
 * - listGames(): List all games with metadata
 * - subscribeToGame(code, callback): Subscribe to real-time updates (optional)
 */
export class StorageAdapter {
  /**
   * Save game state to storage
   * 
   * @param {string} code - Game code (5-letter code)
   * @param {Object} state - Game state object with structure { G: {...}, ctx: {...} }
   * @param {Object} metadata - Game metadata (e.g., { lastModified: string, playerNames: Array<string> })
   * @param {string} [expectedLastModified] - Optional: expected last_modified timestamp for optimistic locking (cloud adapters only)
   * @returns {Promise<boolean|{success: boolean, conflict?: boolean, lastModified?: string}>} - True if saved successfully, or result object with success flag and optional conflict/lastModified info
   */
  async saveGame(code, state, metadata, expectedLastModified) {
    throw new Error('saveGame must be implemented by storage adapter');
  }

  /**
   * Load game state from storage
   * 
   * @param {string} code - Game code
   * @returns {Promise<{G: Object, ctx: Object}|null>} - Game state or null if not found
   */
  async loadGame(code) {
    throw new Error('loadGame must be implemented by storage adapter');
  }

  /**
   * Delete a game from storage
   * 
   * @param {string} code - Game code
   * @returns {Promise<boolean>} - True if deleted successfully, false if not found
   */
  async deleteGame(code) {
    throw new Error('deleteGame must be implemented by storage adapter');
  }

  /**
   * List all games with their metadata
   * 
   * @returns {Promise<Array<{code: string, phase: string, turn: number, numPlayers: number, lastModified: string, playerNames: Array<string>, metadata: Object}>>} - Array of game info, sorted by lastModified descending
   */
  async listGames() {
    throw new Error('listGames must be implemented by storage adapter');
  }

  /**
   * Subscribe to real-time updates for a game
   * 
   * This method is optional - adapters that don't support real-time (like localStorage)
   * can return a no-op unsubscribe function.
   * 
   * @param {string} code - Game code
   * @param {Function} callback - Callback function that receives updated game state: (state, metadata, lastModified) => void
   *   - state: {G: Object, ctx: Object} - Deserialized game state
   *   - metadata: Object - Game metadata
   *   - lastModified: string|null - Last modified timestamp from database (if available)
   * @returns {Function} - Unsubscribe function
   */
  subscribeToGame(code, callback) {
    // Default implementation: no-op (localStorage doesn't support real-time)
    // Cloud adapters should override this to provide real-time subscriptions
    return () => {}; // Return no-op unsubscribe function
  }

  /**
   * Check if a game exists
   * 
   * @param {string} code - Game code
   * @returns {Promise<boolean>} - True if game exists
   */
  async gameExists(code) {
    const game = await this.loadGame(code);
    return game !== null;
  }

  /**
   * Get the last modified timestamp for a game
   * 
   * This method is optional - adapters that don't track timestamps (like localStorage)
   * return null. Cloud adapters should override this to return the actual timestamp.
   * 
   * @param {string} code - Game code
   * @returns {Promise<string|null>} - ISO 8601 timestamp or null if not available
   */
  async getLastModified(code) {
    // Default implementation: timestamps not supported
    // Cloud adapters should override this
    return null;
  }

  /**
   * Get game metadata without loading full game state
   * 
   * @param {string} code - Game code
   * @returns {Promise<Object|null>} - Game metadata or null if not found
   */
  async getGameMetadata(code) {
    throw new Error('getGameMetadata must be implemented by storage adapter');
  }

  /**
   * Update game metadata without modifying game state
   * Merges the provided metadata with existing metadata.
   * 
   * @param {string} code - Game code
   * @param {Object} metadata - Metadata to merge with existing metadata
   * @returns {Promise<boolean>} - True if updated successfully
   */
  async updateGameMetadata(code, metadata) {
    throw new Error('updateGameMetadata must be implemented by storage adapter');
  }
}
