/**
 * LocalStorage Storage Adapter
 * 
 * Implements the StorageAdapter interface using browser localStorage.
 * This is the default storage mechanism for single-device game persistence.
 * 
 * Uses three localStorage keys:
 * - game_state: Map of game code → {G, ctx}
 * - game_metadata: Map of game code → metadata (includes lastModified)
 * - game_initial: Map of game code → initial state (for future use)
 */

import { StorageAdapter } from './storageAdapter';
import { serializeState, deserializeState, isValidSerializedState } from '../stateSerialization';

// Storage keys - using legacy format for backward compatibility with existing saved games
const GAME_STATE_KEY = 'game_state';
const GAME_METADATA_KEY = 'game_metadata';
const GAME_INITIAL_KEY = 'game_initial';

/**
 * LocalStorageAdapter - Implements StorageAdapter using browser localStorage
 */
export class LocalStorageAdapter extends StorageAdapter {
  /**
   * Get all game storage data from localStorage
   * @param {string} key - Storage key (state, metadata, or initial)
   * @returns {Map} - Map of game code to data
   */
  _getGameData(key) {
    try {
      const data = localStorage.getItem(key);
      if (!data) {
        return new Map();
      }
      
      try {
        const parsed = JSON.parse(data);
        if (!Array.isArray(parsed)) {
          console.error(`[LocalStorageAdapter] Invalid data format for key "${key}": expected array, got ${typeof parsed}`);
          // Attempt recovery: clear corrupted data
          localStorage.removeItem(key);
          return new Map();
        }
        return new Map(parsed);
      } catch (parseError) {
        console.error(`[LocalStorageAdapter] Failed to parse JSON for key "${key}":`, parseError.message);
        console.error(`[LocalStorageAdapter] Corrupted data (first 200 chars):`, data.substring(0, 200));
        // Attempt recovery: clear corrupted data
        try {
          localStorage.removeItem(key);
          console.warn(`[LocalStorageAdapter] Cleared corrupted data for key "${key}"`);
        } catch (removeError) {
          console.error(`[LocalStorageAdapter] Failed to clear corrupted data for key "${key}":`, removeError.message);
        }
        return new Map();
      }
    } catch (e) {
      console.error(`[LocalStorageAdapter] Unexpected error accessing localStorage for key "${key}":`, e.message);
      console.error(`[LocalStorageAdapter] Error details:`, e);
      return new Map();
    }
  }

  /**
   * Set game storage data in localStorage
   * @param {string} key - Storage key (state, metadata, or initial)
   * @param {Map} dataMap - Map of game code to data
   * @returns {boolean} - True if saved successfully
   */
  _setGameData(key, dataMap) {
    try {
      if (!(dataMap instanceof Map)) {
        console.error(`[LocalStorageAdapter] Invalid dataMap type for key "${key}": expected Map, got ${typeof dataMap}`);
        return false;
      }
      
      const serialized = JSON.stringify(Array.from(dataMap.entries()));
      
      // Check localStorage quota (rough estimate)
      const currentSize = new Blob([serialized]).size;
      if (currentSize > 5 * 1024 * 1024) { // 5MB warning
        console.warn(`[LocalStorageAdapter] Large data size for key "${key}": ${(currentSize / 1024 / 1024).toFixed(2)}MB`);
      }
      
      localStorage.setItem(key, serialized);
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.error(`[LocalStorageAdapter] Storage quota exceeded for key "${key}"`);
        console.error(`[LocalStorageAdapter] Attempting to free space by clearing old games...`);
        // Could implement cleanup logic here if needed
      } else {
        console.error(`[LocalStorageAdapter] Failed to save data for key "${key}":`, e.message);
        console.error(`[LocalStorageAdapter] Error details:`, e);
      }
      return false;
    }
  }

  /**
   * Normalize game code to uppercase for case-insensitive comparison
   * @param {string} code - Game code to normalize
   * @returns {string} - Uppercase code
   */
  _normalizeCode(code) {
    return code ? code.toUpperCase().trim() : '';
  }

  /**
   * Validate game code format
   * @param {string} code - Game code to validate
   * @returns {boolean} - True if valid format
   */
  _isValidCode(code) {
    if (!code) return false;
    const normalized = this._normalizeCode(code);
    return /^[A-Z]{4,5}$/.test(normalized);
  }

  /**
   * Save game state to localStorage
   * 
   * @param {string} code - Game code
   * @param {Object} state - Game state object with structure { G: {...}, ctx: {...} }
   * @param {Object} metadata - Game metadata (e.g., { lastModified: string, playerNames: Array<string> })
   * @returns {Promise<boolean>} - True if saved successfully
   */
  async saveGame(code, state, metadata = {}) {
    const operation = 'saveGame';
    
    if (!this._isValidCode(code)) {
      console.error(`[LocalStorageAdapter.${operation}] Invalid game code format:`, code);
      return false;
    }

    const normalizedCode = this._normalizeCode(code);
    
    try {
      // Validate input state
      if (!state || typeof state !== 'object') {
        console.error(`[LocalStorageAdapter.${operation}] Invalid state parameter for game "${normalizedCode}": expected object, got ${typeof state}`);
        return false;
      }

      const { G, ctx } = state;
      
      if (!G || typeof G !== 'object') {
        console.error(`[LocalStorageAdapter.${operation}] Invalid G parameter for game "${normalizedCode}": expected object, got ${typeof G}`);
        return false;
      }
      
      if (!ctx || typeof ctx !== 'object') {
        console.error(`[LocalStorageAdapter.${operation}] Invalid ctx parameter for game "${normalizedCode}": expected object, got ${typeof ctx}`);
        return false;
      }
      
      // Get existing state map
      const stateMap = this._getGameData(GAME_STATE_KEY);
      
      // Serialize state using serialization utilities
      // This ensures proper deep cloning and filtering of internal properties
      let serialized;
      try {
        serialized = serializeState(G, ctx);
      } catch (serializeError) {
        console.error(`[LocalStorageAdapter.${operation}] Serialization failed for game "${normalizedCode}":`, serializeError.message);
        console.error(`[LocalStorageAdapter.${operation}] Serialization error details:`, serializeError);
        return false;
      }
      
      stateMap.set(normalizedCode, serialized);
      
      const saved = this._setGameData(GAME_STATE_KEY, stateMap);
      if (!saved) {
        console.error(`[LocalStorageAdapter.${operation}] Failed to persist state to localStorage for game "${normalizedCode}"`);
        return false;
      }
      
      // Update metadata (merge with existing metadata)
      const metadataMap = this._getGameData(GAME_METADATA_KEY);
      const existingMetadata = metadataMap.get(normalizedCode) || {};
      const updatedMetadata = {
        ...existingMetadata,
        ...metadata,
        lastModified: metadata.lastModified || new Date().toISOString() // ISO 8601 format for cloud compatibility
      };
      metadataMap.set(normalizedCode, updatedMetadata);
      this._setGameData(GAME_METADATA_KEY, metadataMap);
      
      return true;
    } catch (e) {
      console.error(`[LocalStorageAdapter.${operation}] Unexpected error saving state for game "${normalizedCode}":`, e.message);
      console.error(`[LocalStorageAdapter.${operation}] Error details:`, e);
      console.error(`[LocalStorageAdapter.${operation}] Stack trace:`, e.stack);
      return false;
    }
  }

  /**
   * Load game state from localStorage
   * 
   * @param {string} code - Game code
   * @returns {Promise<{G: Object, ctx: Object}|null>} - Game state or null if not found/invalid
   */
  async loadGame(code) {
    const operation = 'loadGame';
    
    if (!this._isValidCode(code)) {
      console.error(`[LocalStorageAdapter.${operation}] Invalid game code format:`, code);
      return null;
    }

    const normalizedCode = this._normalizeCode(code);
    
    try {
      const stateMap = this._getGameData(GAME_STATE_KEY);
      const stateData = stateMap.get(normalizedCode);
      
      if (!stateData) {
        console.info(`[LocalStorageAdapter.${operation}] No saved state found for game:`, normalizedCode);
        return null;
      }
      
      // Validate state structure before deserializing
      if (!isValidSerializedState(stateData)) {
        console.warn(`[LocalStorageAdapter.${operation}] Invalid state format for game "${normalizedCode}"`);
        console.warn(`[LocalStorageAdapter.${operation}] State data type:`, typeof stateData);
        console.warn(`[LocalStorageAdapter.${operation}] State data keys:`, stateData && typeof stateData === 'object' ? Object.keys(stateData) : 'N/A');
        
        // Attempt recovery: remove corrupted state
        console.warn(`[LocalStorageAdapter.${operation}] Attempting to remove corrupted state for game "${normalizedCode}"`);
        try {
          stateMap.delete(normalizedCode);
          this._setGameData(GAME_STATE_KEY, stateMap);
          console.warn(`[LocalStorageAdapter.${operation}] Removed corrupted state for game "${normalizedCode}"`);
        } catch (recoveryError) {
          console.error(`[LocalStorageAdapter.${operation}] Failed to remove corrupted state:`, recoveryError.message);
        }
        
        return null;
      }
      
      // Deserialize state using serialization utilities
      // This ensures clean state structure and proper deep cloning
      try {
        return deserializeState(stateData);
      } catch (deserializeError) {
        console.error(`[LocalStorageAdapter.${operation}] Deserialization failed for game "${normalizedCode}":`, deserializeError.message);
        console.error(`[LocalStorageAdapter.${operation}] Deserialization error details:`, deserializeError);
        
        // Attempt recovery: remove corrupted state
        console.warn(`[LocalStorageAdapter.${operation}] Attempting to remove corrupted state after deserialization failure`);
        try {
          stateMap.delete(normalizedCode);
          this._setGameData(GAME_STATE_KEY, stateMap);
          console.warn(`[LocalStorageAdapter.${operation}] Removed corrupted state for game "${normalizedCode}"`);
        } catch (recoveryError) {
          console.error(`[LocalStorageAdapter.${operation}] Failed to remove corrupted state:`, recoveryError.message);
        }
        
        return null;
      }
    } catch (e) {
      console.error(`[LocalStorageAdapter.${operation}] Unexpected error loading state for game "${normalizedCode}":`, e.message);
      console.error(`[LocalStorageAdapter.${operation}] Error details:`, e);
      console.error(`[LocalStorageAdapter.${operation}] Stack trace:`, e.stack);
      return null;
    }
  }

  /**
   * Delete a game from localStorage
   * 
   * @param {string} code - Game code
   * @returns {Promise<boolean>} - True if deleted successfully, false if not found
   */
  async deleteGame(code) {
    const operation = 'deleteGame';
    
    if (!this._isValidCode(code)) {
      console.error(`[LocalStorageAdapter.${operation}] Invalid game code format:`, code);
      return false;
    }
    
    const normalizedCode = this._normalizeCode(code);
    
    try {
      const stateMap = this._getGameData(GAME_STATE_KEY);
      
      if (!stateMap.has(normalizedCode)) {
        console.warn(`[LocalStorageAdapter.${operation}] Game not found:`, normalizedCode);
        return false;
      }
      
      // Remove from all three storage keys
      const metadataMap = this._getGameData(GAME_METADATA_KEY);
      const initialMap = this._getGameData(GAME_INITIAL_KEY);
      
      stateMap.delete(normalizedCode);
      metadataMap.delete(normalizedCode);
      initialMap.delete(normalizedCode);
      
      // Save changes, checking for errors
      const stateSaved = this._setGameData(GAME_STATE_KEY, stateMap);
      const metadataSaved = this._setGameData(GAME_METADATA_KEY, metadataMap);
      const initialSaved = this._setGameData(GAME_INITIAL_KEY, initialMap);
      
      if (!stateSaved || !metadataSaved || !initialSaved) {
        console.error(`[LocalStorageAdapter.${operation}] Failed to save some data after deletion for game:`, normalizedCode);
        console.error(`[LocalStorageAdapter.${operation}] State saved: ${stateSaved}, Metadata saved: ${metadataSaved}, Initial saved: ${initialSaved}`);
        // Still return true if at least state was deleted
        return true;
      }
      
      return true;
    } catch (e) {
      console.error(`[LocalStorageAdapter.${operation}] Unexpected error deleting game "${normalizedCode}":`, e.message);
      console.error(`[LocalStorageAdapter.${operation}] Error details:`, e);
      return false;
    }
  }

  /**
   * List all games with their metadata
   * 
   * @returns {Promise<Array<{code: string, phase: string, turn: number, numPlayers: number, lastModified: string, playerNames: Array<string>, metadata: Object}>>} - Array of game info, sorted by lastModified descending
   */
  async listGames() {
    const operation = 'listGames';
    
    try {
      const stateMap = this._getGameData(GAME_STATE_KEY);
      const metadataMap = this._getGameData(GAME_METADATA_KEY);
      const games = [];
      
      for (const [code, state] of stateMap.entries()) {
        // Only include valid game codes
        if (!this._isValidCode(code)) {
          continue;
        }
        
        try {
          const metadata = metadataMap.get(code) || {};
          
          if (state) {
            // Extract player names from the game state
            const playerNames = state.G?.players?.map(([id, player]) => player.name) || [];
            
            games.push({
              code: code,
              phase: state.ctx?.phase || 'unknown',
              turn: state.ctx?.turn || 0,
              numPlayers: state.ctx?.numPlayers || 0,
              lastModified: metadata.lastModified || new Date(0).toISOString(), // Default to epoch if missing
              playerNames: playerNames,
              metadata: metadata
            });
          }
        } catch (e) {
          console.warn(`[LocalStorageAdapter.${operation}] Error processing game "${code}":`, e.message);
          // Continue processing other games
        }
      }
      
      // Sort by lastModified descending (most recent first)
      return games.sort((a, b) => {
        const timeA = new Date(a.lastModified).getTime();
        const timeB = new Date(b.lastModified).getTime();
        return timeB - timeA; // Descending order
      });
    } catch (e) {
      console.error(`[LocalStorageAdapter.${operation}] Unexpected error listing games:`, e.message);
      console.error(`[LocalStorageAdapter.${operation}] Error details:`, e);
      return [];
    }
  }

  /**
   * Subscribe to real-time updates for a game
   * 
   * localStorage doesn't support real-time updates, so this returns a no-op unsubscribe function.
   * 
   * @param {string} code - Game code
   * @param {Function} callback - Callback function (not used for localStorage)
   * @returns {Function} - No-op unsubscribe function
   */
  subscribeToGame(code, callback) {
    // localStorage doesn't support real-time updates
    // Return a no-op unsubscribe function
    return () => {};
  }

  /**
   * Get game metadata without loading full game state
   * 
   * @param {string} code - Game code
   * @returns {Promise<Object|null>} - Game metadata or null if not found
   */
  async getGameMetadata(code) {
    const operation = 'getGameMetadata';
    
    if (!this._isValidCode(code)) {
      console.error(`[LocalStorageAdapter.${operation}] Invalid game code format:`, code);
      return null;
    }

    const normalizedCode = this._normalizeCode(code);
    
    try {
      const metadataMap = this._getGameData(GAME_METADATA_KEY);
      const metadata = metadataMap.get(normalizedCode);
      
      if (!metadata) {
        console.info(`[LocalStorageAdapter.${operation}] No metadata found for game:`, normalizedCode);
        return null;
      }
      
      return metadata;
    } catch (e) {
      console.error(`[LocalStorageAdapter.${operation}] Error getting metadata for game "${normalizedCode}":`, e.message);
      return null;
    }
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
    const operation = 'updateGameMetadata';
    
    if (!this._isValidCode(code)) {
      console.error(`[LocalStorageAdapter.${operation}] Invalid game code format:`, code);
      return false;
    }

    const normalizedCode = this._normalizeCode(code);
    
    try {
      // Check if game exists (via state map)
      const stateMap = this._getGameData(GAME_STATE_KEY);
      if (!stateMap.has(normalizedCode)) {
        console.error(`[LocalStorageAdapter.${operation}] Game not found:`, normalizedCode);
        return false;
      }
      
      // Get existing metadata and merge
      const metadataMap = this._getGameData(GAME_METADATA_KEY);
      const existingMetadata = metadataMap.get(normalizedCode) || {};
      const updatedMetadata = {
        ...existingMetadata,
        ...metadata,
        lastModified: new Date().toISOString()
      };
      
      metadataMap.set(normalizedCode, updatedMetadata);
      const saved = this._setGameData(GAME_METADATA_KEY, metadataMap);
      
      if (!saved) {
        console.error(`[LocalStorageAdapter.${operation}] Failed to save metadata for game "${normalizedCode}"`);
        return false;
      }
      
      return true;
    } catch (e) {
      console.error(`[LocalStorageAdapter.${operation}] Error updating metadata for game "${normalizedCode}":`, e.message);
      return false;
    }
  }
}
