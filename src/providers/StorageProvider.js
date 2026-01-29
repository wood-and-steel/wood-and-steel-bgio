import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { getStorageAdapter } from '../utils/storage';
import { isSupabaseConfigured } from '../config/storage';
import { 
  isValidGameCode, 
  normalizeGameCode,
  getDevicePlayerID,
  getDeviceSeat,
  getPlayerSeats as getPlayerSeatsFromManager,
  assignPlayerSeat as assignPlayerSeatInManager,
  updatePlayerName as updatePlayerNameInManager,
  assignRandomPlayerIDs as assignRandomPlayerIDsInManager,
  isHost as isHostInManager,
  getNumPlayersJoined as getNumPlayersJoinedFromManager,
  allPlayersJoined as allPlayersJoinedFromManager,
  getGameMetadata as getGameMetadataFromManager,
  SeatAssignmentError,
} from '../utils/gameManager';

/**
 * StorageProvider Context
 * 
 * Manages storage type selection (Local vs Cloud) and provides storage-related utilities.
 * Also prepares for future BYOD (bring your own device) multiplayer mode.
 * 
 * Storage Types:
 * - 'local': Uses localStorage adapter (hotseat mode only)
 * - 'cloud': Uses Supabase adapter (hotseat now, BYOD in future)
 * 
 * BYOD Mode (future):
 * - Each player uses their own device
 * - Game state stored in cloud
 * - Players join via game code
 * - Each device tracks its assigned player seat
 */

const StorageContext = createContext(null);

// localStorage keys
const STORAGE_PREFERENCE_KEY = 'storage_preference';
const CURRENT_GAME_LOCAL_KEY = 'current_game_local';
const CURRENT_GAME_CLOUD_KEY = 'current_game_cloud';
const DEVICE_ID_KEY = 'device_id';

/**
 * Generate a UUID v4.
 * Uses crypto.randomUUID() if available, otherwise falls back to manual generation.
 * 
 * @returns {string} - UUID v4 string (e.g., '550e8400-e29b-41d4-a716-446655440000')
 */
function generateUUID() {
  // Use native crypto.randomUUID() if available (modern browsers)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  
  // Fallback for older browsers: manual UUID v4 generation
  // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  // Where x is any hex digit and y is one of 8, 9, a, or b
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Get the device ID for this browser/device.
 * If no device ID exists in localStorage, generates a new one and stores it.
 * The device ID persists across sessions and is used to identify this device
 * when joining BYOD games.
 * 
 * @returns {string} - Device UUID
 */
function getDeviceId() {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  
  if (!deviceId) {
    deviceId = generateUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
    console.log('[StorageProvider] Generated new device ID:', deviceId);
  }
  
  return deviceId;
}

/**
 * StorageProvider Component
 * 
 * Provides storage management context to the application.
 * Manages active storage type, current game tracking, and BYOD preparation utilities.
 */
export function StorageProvider({ children }) {
  // Initialize storage type from localStorage, default to 'local'
  const [storageType, setStorageTypeState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_PREFERENCE_KEY);
    return (saved === 'local' || saved === 'cloud') ? saved : 'local';
  });

  // Use cached adapters from storage module. Never create new Supabase clients on tab
  // switch; multiple GoTrueClient instances in the same context cause Supabase warnings
  // and undefined behavior. getStorageAdapter(type) returns a singleton per type.
  const adapter = useMemo(() => {
    const type = storageType === 'cloud' && !isSupabaseConfigured() ? 'local' : storageType;
    if (type === 'local' && storageType === 'cloud') {
      console.warn('[StorageProvider] Supabase not configured, falling back to localStorage');
    }
    return getStorageAdapter(type);
  }, [storageType]);

  // Set storage type and persist to localStorage
  const setStorageType = useCallback((type) => {
    if (type !== 'local' && type !== 'cloud') {
      console.error('[StorageProvider] Invalid storage type:', type);
      return;
    }
    if (type === 'cloud' && !isSupabaseConfigured()) {
      console.warn('[StorageProvider] Cannot switch to cloud: Supabase not configured');
      return;
    }
    setStorageTypeState(type);
    localStorage.setItem(STORAGE_PREFERENCE_KEY, type);
  }, []);

  // Get current game code for active storage type
  const getCurrentGameCode = useCallback(() => {
    const key = storageType === 'local' ? CURRENT_GAME_LOCAL_KEY : CURRENT_GAME_CLOUD_KEY;
    return localStorage.getItem(key);
  }, [storageType]);

  // Set current game code for active storage type
  const setCurrentGameCode = useCallback((code) => {
    if (!isValidGameCode(code)) {
      throw new Error(`Invalid game code format: ${code}`);
    }
    const normalizedCode = normalizeGameCode(code);
    const key = storageType === 'local' ? CURRENT_GAME_LOCAL_KEY : CURRENT_GAME_CLOUD_KEY;
    localStorage.setItem(key, normalizedCode);
  }, [storageType]);

  // Clear current game code for active storage type
  const clearCurrentGameCode = useCallback(() => {
    const key = storageType === 'local' ? CURRENT_GAME_LOCAL_KEY : CURRENT_GAME_CLOUD_KEY;
    localStorage.removeItem(key);
  }, [storageType]);

  // Get current game code for a specific storage type (for cross-storage operations)
  const getCurrentGameCodeForType = useCallback((type) => {
    const key = type === 'local' ? CURRENT_GAME_LOCAL_KEY : CURRENT_GAME_CLOUD_KEY;
    return localStorage.getItem(key);
  }, []);

  // Set current game code for a specific storage type
  const setCurrentGameCodeForType = useCallback((type, code) => {
    if (!isValidGameCode(code)) {
      throw new Error(`Invalid game code format: ${code}`);
    }
    const normalizedCode = normalizeGameCode(code);
    const key = type === 'local' ? CURRENT_GAME_LOCAL_KEY : CURRENT_GAME_CLOUD_KEY;
    localStorage.setItem(key, normalizedCode);
  }, []);

  // ============================================================================
  // BYOD Preparation: Player Seat Management
  // ============================================================================
  // These functions are implemented now for future BYOD mode.
  // In BYOD mode, each device will have an assigned player seat (playerID).
  // This is stored per-game in localStorage.

  /**
   * Get the player seat (playerID) assigned to this device for a BYOD game.
   * 
   * @param {string} gameCode - Game code
   * @returns {string|null} - Player ID ('0', '1', etc.) or null if not assigned
   */
  const getPlayerSeat = useCallback((gameCode) => {
    if (!isValidGameCode(gameCode)) {
      return null;
    }
    const normalizedCode = normalizeGameCode(gameCode);
    const key = `byod_player_seat_${normalizedCode}`;
    return localStorage.getItem(key);
  }, []);

  /**
   * Set the player seat (playerID) assigned to this device for a BYOD game.
   * 
   * @param {string} gameCode - Game code
   * @param {string} playerID - Player ID ('0', '1', etc.)
   */
  const setPlayerSeat = useCallback((gameCode, playerID) => {
    if (!isValidGameCode(gameCode)) {
      throw new Error(`Invalid game code format: ${gameCode}`);
    }
    if (typeof playerID !== 'string' || !/^\d+$/.test(playerID)) {
      throw new Error(`Invalid playerID format: ${playerID}`);
    }
    const normalizedCode = normalizeGameCode(gameCode);
    const key = `byod_player_seat_${normalizedCode}`;
    localStorage.setItem(key, playerID);
  }, []);

  /**
   * Clear the player seat assignment for a BYOD game.
   * 
   * @param {string} gameCode - Game code
   */
  const clearPlayerSeat = useCallback((gameCode) => {
    if (!isValidGameCode(gameCode)) {
      return;
    }
    const normalizedCode = normalizeGameCode(gameCode);
    const key = `byod_player_seat_${normalizedCode}`;
    localStorage.removeItem(key);
  }, []);

  // ============================================================================
  // BYOD: Game Mode Utilities
  // ============================================================================
  // These functions help distinguish between hotseat and BYOD games.
  // Game mode is stored in game metadata and read from storage adapters.

  /**
   * Get the game mode for a game.
   * Reads from game metadata: metadata.gameMode
   * 
   * @param {string} gameCode - Game code
   * @returns {Promise<'hotseat'|'byod'>} - Game mode, defaults to 'hotseat'
   */
  const getGameMode = useCallback(async (gameCode) => {
    if (!isValidGameCode(gameCode)) {
      return 'hotseat';
    }
    
    try {
      // List games to get metadata (includes gameMode)
      const games = await adapter.listGames();
      const normalizedCode = normalizeGameCode(gameCode);
      const game = games.find(g => g.code === normalizedCode);
      
      if (game && game.metadata && game.metadata.gameMode) {
        return game.metadata.gameMode;
      }
      
      // Default to hotseat for games without gameMode metadata (backward compatibility)
      return 'hotseat';
    } catch (e) {
      console.error('[StorageProvider] Error getting game mode:', e.message);
      return 'hotseat';
    }
  }, [adapter]);

  /**
   * Check if a game is in BYOD mode.
   * 
   * @param {string} gameCode - Game code
   * @returns {Promise<boolean>} - True if BYOD game
   */
  const isBYODGame = useCallback(async (gameCode) => {
    const mode = await getGameMode(gameCode);
    return mode === 'byod';
  }, [getGameMode]);

  /**
   * Get the player ID for this device in a game.
   * For BYOD games, returns the assigned player seat from game metadata.
   * For hotseat games, returns null (all players on same device).
   * 
   * @param {string} gameCode - Game code
   * @returns {Promise<string|null>} - Player ID or null
   */
  const getMyPlayerID = useCallback(async (gameCode) => {
    const isBYOD = await isBYODGame(gameCode);
    if (isBYOD) {
      const deviceId = getDeviceId();
      // Use the gameManager function that reads from game metadata
      return await getDevicePlayerID(gameCode, deviceId, storageType);
    }
    return null; // Hotseat: all players on same device
  }, [isBYODGame, storageType]);

  // ============================================================================
  // BYOD: Seat Assignment API (delegates to gameManager)
  // ============================================================================

  /**
   * Join a BYOD game by assigning this device to a seat.
   * 
   * @param {string} gameCode - Game code to join
   * @returns {Promise<{success: boolean, error?: string, seat?: Object}>} - Result
   */
  const joinGame = useCallback(async (gameCode) => {
    const deviceId = getDeviceId();
    return await assignPlayerSeatInManager(gameCode, deviceId, 'cloud');
  }, []);

  /**
   * Update this player's name in a BYOD game.
   * 
   * @param {string} gameCode - Game code
   * @param {string} playerName - New player name
   * @returns {Promise<{success: boolean, error?: string}>} - Result
   */
  const updateMyPlayerName = useCallback(async (gameCode, playerName) => {
    const deviceId = getDeviceId();
    return await updatePlayerNameInManager(gameCode, deviceId, playerName, 'cloud');
  }, []);

  /**
   * Get all player seats for a BYOD game.
   * 
   * @param {string} gameCode - Game code
   * @returns {Promise<Object|null>} - Player seats keyed by deviceId, or null
   */
  const getPlayerSeatsForGame = useCallback(async (gameCode) => {
    return await getPlayerSeatsFromManager(gameCode, 'cloud');
  }, []);

  /**
   * Get this device's seat in a BYOD game.
   * 
   * @param {string} gameCode - Game code
   * @returns {Promise<Object|null>} - Seat object or null
   */
  const getMySeat = useCallback(async (gameCode) => {
    const deviceId = getDeviceId();
    return await getDeviceSeat(gameCode, deviceId, 'cloud');
  }, []);

  /**
   * Check if this device is the host of a BYOD game.
   * 
   * @param {string} gameCode - Game code
   * @returns {Promise<boolean>} - True if this device is the host
   */
  const amIHost = useCallback(async (gameCode) => {
    const deviceId = getDeviceId();
    return await isHostInManager(gameCode, deviceId, 'cloud');
  }, []);

  /**
   * Get the number of players that have joined a BYOD game.
   * 
   * @param {string} gameCode - Game code
   * @returns {Promise<{joined: number, total: number}|null>} - Player counts or null
   */
  const getPlayerCounts = useCallback(async (gameCode) => {
    return await getNumPlayersJoinedFromManager(gameCode, 'cloud');
  }, []);

  /**
   * Check if all players have joined a BYOD game.
   * 
   * @param {string} gameCode - Game code
   * @returns {Promise<boolean>} - True if all players have joined
   */
  const areAllPlayersJoined = useCallback(async (gameCode) => {
    return await allPlayersJoinedFromManager(gameCode, 'cloud');
  }, []);

  /**
   * Start a BYOD game by assigning random playerIDs (host only).
   * 
   * @param {string} gameCode - Game code
   * @returns {Promise<{success: boolean, error?: string, assignments?: Object}>} - Result
   */
  const startBYODGame = useCallback(async (gameCode) => {
    const deviceId = getDeviceId();
    return await assignRandomPlayerIDsInManager(gameCode, deviceId, 'cloud');
  }, []);

  /**
   * Get game metadata for a game.
   * 
   * @param {string} gameCode - Game code
   * @returns {Promise<Object|null>} - Game metadata or null
   */
  const getMetadata = useCallback(async (gameCode) => {
    return await getGameMetadataFromManager(gameCode, storageType);
  }, [storageType]);

  // Context value
  const value = useMemo(() => ({
    // Storage type management
    storageType,
    setStorageType,
    getStorageAdapter: () => adapter,
    
    // Current game management
    getCurrentGameCode,
    setCurrentGameCode,
    clearCurrentGameCode,
    getCurrentGameCodeForType,
    setCurrentGameCodeForType,
    
    // BYOD: Device identification
    getDeviceId,
    
    // BYOD: Player seat management (legacy local storage)
    getPlayerSeat,
    setPlayerSeat,
    clearPlayerSeat,
    
    // BYOD: Game mode utilities
    getGameMode,
    isBYODGame,
    getMyPlayerID,
    
    // BYOD: Seat assignment API (uses gameManager, stores in cloud metadata)
    joinGame,
    updateMyPlayerName,
    getPlayerSeatsForGame,
    getMySeat,
    amIHost,
    getPlayerCounts,
    areAllPlayersJoined,
    startBYODGame,
    getMetadata,
    
    // BYOD: Error codes
    SeatAssignmentError,
  }), [
    storageType,
    setStorageType,
    adapter,
    getCurrentGameCode,
    setCurrentGameCode,
    clearCurrentGameCode,
    getCurrentGameCodeForType,
    setCurrentGameCodeForType,
    getPlayerSeat,
    setPlayerSeat,
    clearPlayerSeat,
    getGameMode,
    isBYODGame,
    getMyPlayerID,
    joinGame,
    updateMyPlayerName,
    getPlayerSeatsForGame,
    getMySeat,
    amIHost,
    getPlayerCounts,
    areAllPlayersJoined,
    startBYODGame,
    getMetadata,
  ]);

  return (
    <StorageContext.Provider value={value}>
      {children}
    </StorageContext.Provider>
  );
}

/**
 * Hook to access StorageProvider context
 * 
 * @returns {Object} Storage context value
 * @throws {Error} If used outside StorageProvider
 */
export function useStorage() {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within StorageProvider');
  }
  return context;
}
