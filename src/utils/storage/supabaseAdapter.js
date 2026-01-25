/**
 * Supabase Storage Adapter
 * 
 * Implements the StorageAdapter interface using Supabase PostgreSQL database.
 * This adapter provides cloud storage with real-time synchronization for multiplayer games.
 * 
 * Features:
 * - Anonymous authentication (no user accounts required)
 * - PostgreSQL database storage
 * - Real-time subscriptions via Supabase Realtime
 * - Game code-based access (5-letter codes)
 * 
 * Database Schema:
 * - Table: games
 *   - code VARCHAR(5) PRIMARY KEY
 *   - state JSONB NOT NULL (contains {G: {...}, ctx: {...}})
 *   - metadata JSONB (contains {lastModified, playerNames, ...})
 *   - created_at TIMESTAMPTZ DEFAULT NOW()
 *   - updated_at TIMESTAMPTZ DEFAULT NOW()
 */

import { StorageAdapter } from './storageAdapter';
import { serializeState, deserializeState, isValidSerializedState } from '../stateSerialization';
import { createClient } from '@supabase/supabase-js';

/**
 * SupabaseAdapter - Implements StorageAdapter using Supabase PostgreSQL database
 */
export class SupabaseAdapter extends StorageAdapter {
  /**
   * Initialize Supabase client and authenticate anonymously
   * 
   * @param {string} supabaseUrl - Supabase project URL
   * @param {string} supabaseAnonKey - Supabase anonymous key
   */
  constructor(supabaseUrl, supabaseAnonKey) {
    super();
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('SupabaseAdapter: supabaseUrl and supabaseAnonKey are required');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
    this.initialized = false;
    this.initializationPromise = null;
    this.activeSubscriptions = new Map(); // Map of code -> channel
  }

  /**
   * Initialize anonymous authentication
   * This is called lazily on first use to avoid blocking constructor
   * 
   * @returns {Promise<void>}
   */
  async _ensureInitialized() {
    if (this.initialized) {
      return;
    }
    
    // If initialization is already in progress, wait for it
    if (this.initializationPromise) {
      return this.initializationPromise;
    }
    
    // Start initialization
    this.initializationPromise = this._initialize();
    try {
      await this.initializationPromise;
      this.initialized = true;
    } catch (error) {
      this.initializationPromise = null;
      throw error;
    }
  }

  /**
   * Perform anonymous authentication
   * 
   * @returns {Promise<void>}
   */
  async _initialize() {
    try {
      const { data, error } = await this.supabase.auth.signInAnonymously();
      
      if (error) {
        // If already signed in, that's okay
        if (error.message.includes('already signed in') || error.message.includes('User already registered')) {
          console.info('[SupabaseAdapter] Already authenticated anonymously');
          return;
        }
        throw new Error(`SupabaseAdapter: Failed to authenticate anonymously: ${error.message}`);
      }
      
      console.info('[SupabaseAdapter] Successfully authenticated anonymously');
    } catch (error) {
      console.error('[SupabaseAdapter] Initialization error:', error);
      throw error;
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
   * Save game state to Supabase
   * 
   * @param {string} code - Game code
   * @param {Object} state - Game state object with structure { G: {...}, ctx: {...} }
   * @param {Object} metadata - Game metadata (e.g., { lastModified: string, playerNames: Array<string> })
   * @returns {Promise<boolean>} - True if saved successfully
   */
  async saveGame(code, state, metadata = {}) {
    const operation = 'saveGame';
    
    if (!this._isValidCode(code)) {
      console.error(`[SupabaseAdapter.${operation}] Invalid game code format:`, code);
      return false;
    }

    const normalizedCode = this._normalizeCode(code);
    
    try {
      await this._ensureInitialized();
      
      // Validate input state
      if (!state || typeof state !== 'object') {
        console.error(`[SupabaseAdapter.${operation}] Invalid state parameter for game "${normalizedCode}": expected object, got ${typeof state}`);
        return false;
      }

      const { G, ctx } = state;
      
      if (!G || typeof G !== 'object') {
        console.error(`[SupabaseAdapter.${operation}] Invalid G parameter for game "${normalizedCode}": expected object, got ${typeof G}`);
        return false;
      }
      
      if (!ctx || typeof ctx !== 'object') {
        console.error(`[SupabaseAdapter.${operation}] Invalid ctx parameter for game "${normalizedCode}": expected object, got ${typeof ctx}`);
        return false;
      }
      
      // Serialize state using serialization utilities
      let serialized;
      try {
        serialized = serializeState(G, ctx);
      } catch (serializeError) {
        console.error(`[SupabaseAdapter.${operation}] Serialization failed for game "${normalizedCode}":`, serializeError.message);
        return false;
      }
      
      // Prepare metadata with lastModified
      const now = new Date().toISOString();
      const gameMetadata = {
        ...metadata,
        lastModified: metadata.lastModified || now
      };
      
      // Check if game exists
      const { data: existingGame, error: fetchError } = await this.supabase
        .from('games')
        .select('code, updated_at')
        .eq('code', normalizedCode)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found, which is okay
        console.error(`[SupabaseAdapter.${operation}] Error checking existing game "${normalizedCode}":`, fetchError.message);
        return false;
      }
      
      // Prepare data for upsert
      const gameData = {
        code: normalizedCode,
        state: serialized,
        metadata: gameMetadata,
        updated_at: now
      };
      
      // If game doesn't exist, set created_at
      if (!existingGame) {
        gameData.created_at = now;
      }
      
      // Upsert game (insert or update)
      const { error: upsertError } = await this.supabase
        .from('games')
        .upsert(gameData, {
          onConflict: 'code'
        });
      
      if (upsertError) {
        console.error(`[SupabaseAdapter.${operation}] Failed to save game "${normalizedCode}":`, upsertError.message);
        return false;
      }
      
      console.info(`[SupabaseAdapter.${operation}] Successfully saved game "${normalizedCode}"`);
      return true;
    } catch (e) {
      console.error(`[SupabaseAdapter.${operation}] Unexpected error saving state for game "${normalizedCode}":`, e.message);
      console.error(`[SupabaseAdapter.${operation}] Error details:`, e);
      return false;
    }
  }

  /**
   * Load game state from Supabase
   * 
   * @param {string} code - Game code
   * @returns {Promise<{G: Object, ctx: Object}|null>} - Game state or null if not found/invalid
   */
  async loadGame(code) {
    const operation = 'loadGame';
    
    if (!this._isValidCode(code)) {
      console.error(`[SupabaseAdapter.${operation}] Invalid game code format:`, code);
      return null;
    }

    const normalizedCode = this._normalizeCode(code);
    
    try {
      await this._ensureInitialized();
      
      const { data, error } = await this.supabase
        .from('games')
        .select('state')
        .eq('code', normalizedCode)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Not found - this is okay
          console.info(`[SupabaseAdapter.${operation}] No saved state found for game:`, normalizedCode);
          return null;
        }
        console.error(`[SupabaseAdapter.${operation}] Error loading game "${normalizedCode}":`, error.message);
        return null;
      }
      
      if (!data || !data.state) {
        console.warn(`[SupabaseAdapter.${operation}] Game "${normalizedCode}" has no state data`);
        return null;
      }
      
      const stateData = data.state;
      
      // Validate state structure before deserializing
      if (!isValidSerializedState(stateData)) {
        console.warn(`[SupabaseAdapter.${operation}] Invalid state format for game "${normalizedCode}"`);
        return null;
      }
      
      // Deserialize state using serialization utilities
      try {
        return deserializeState(stateData);
      } catch (deserializeError) {
        console.error(`[SupabaseAdapter.${operation}] Deserialization failed for game "${normalizedCode}":`, deserializeError.message);
        return null;
      }
    } catch (e) {
      console.error(`[SupabaseAdapter.${operation}] Unexpected error loading state for game "${normalizedCode}":`, e.message);
      console.error(`[SupabaseAdapter.${operation}] Error details:`, e);
      return null;
    }
  }

  /**
   * Delete a game from Supabase
   * 
   * @param {string} code - Game code
   * @returns {Promise<boolean>} - True if deleted successfully, false if not found
   */
  async deleteGame(code) {
    const operation = 'deleteGame';
    
    if (!this._isValidCode(code)) {
      console.error(`[SupabaseAdapter.${operation}] Invalid game code format:`, code);
      return false;
    }
    
    const normalizedCode = this._normalizeCode(code);
    
    try {
      await this._ensureInitialized();
      
      // Unsubscribe from real-time updates if active
      if (this.activeSubscriptions.has(normalizedCode)) {
        this._unsubscribeFromGame(normalizedCode);
      }
      
      const { error } = await this.supabase
        .from('games')
        .delete()
        .eq('code', normalizedCode);
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Not found - return false
          console.warn(`[SupabaseAdapter.${operation}] Game not found:`, normalizedCode);
          return false;
        }
        console.error(`[SupabaseAdapter.${operation}] Error deleting game "${normalizedCode}":`, error.message);
        return false;
      }
      
      console.info(`[SupabaseAdapter.${operation}] Successfully deleted game "${normalizedCode}"`);
      return true;
    } catch (e) {
      console.error(`[SupabaseAdapter.${operation}] Unexpected error deleting game "${normalizedCode}":`, e.message);
      console.error(`[SupabaseAdapter.${operation}] Error details:`, e);
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
      await this._ensureInitialized();
      
      const { data, error } = await this.supabase
        .from('games')
        .select('code, state, metadata, updated_at')
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error(`[SupabaseAdapter.${operation}] Error listing games:`, error.message);
        return [];
      }
      
      if (!data || !Array.isArray(data)) {
        return [];
      }
      
      const games = [];
      
      for (const row of data) {
        // Only include valid game codes
        if (!this._isValidCode(row.code)) {
          continue;
        }
        
        try {
          const state = row.state;
          const metadata = row.metadata || {};
          
          if (state && isValidSerializedState(state)) {
            // Extract player names from the game state
            const playerNames = state.G?.players?.map(([id, player]) => player.name) || [];
            
            games.push({
              code: row.code,
              phase: state.ctx?.phase || 'unknown',
              turn: state.ctx?.turn || 0,
              numPlayers: state.ctx?.numPlayers || 0,
              lastModified: metadata.lastModified || row.updated_at || new Date(0).toISOString(),
              playerNames: playerNames,
              metadata: metadata
            });
          }
        } catch (e) {
          console.warn(`[SupabaseAdapter.${operation}] Error processing game "${row.code}":`, e.message);
          // Continue processing other games
        }
      }
      
      // Already sorted by updated_at DESC from query, but ensure lastModified sorting as well
      return games.sort((a, b) => {
        const timeA = new Date(a.lastModified).getTime();
        const timeB = new Date(b.lastModified).getTime();
        return timeB - timeA; // Descending order
      });
    } catch (e) {
      console.error(`[SupabaseAdapter.${operation}] Unexpected error listing games:`, e.message);
      console.error(`[SupabaseAdapter.${operation}] Error details:`, e);
      return [];
    }
  }

  /**
   * Subscribe to real-time updates for a game
   * 
   * Uses Supabase Realtime to listen for database changes.
   * When the game state is updated in the database, the callback is invoked.
   * 
   * @param {string} code - Game code
   * @param {Function} callback - Callback function that receives updated game state: (state, metadata) => void
   * @returns {Function} - Unsubscribe function
   */
  subscribeToGame(code, callback) {
    const operation = 'subscribeToGame';
    
    if (!this._isValidCode(code)) {
      console.error(`[SupabaseAdapter.${operation}] Invalid game code format:`, code);
      return () => {}; // Return no-op unsubscribe
    }
    
    const normalizedCode = this._normalizeCode(code);
    
    // If already subscribed, unsubscribe first
    if (this.activeSubscriptions.has(normalizedCode)) {
      this._unsubscribeFromGame(normalizedCode);
    }
    
    // Ensure initialized before subscribing
    this._ensureInitialized().then(() => {
      const channel = this.supabase
        .channel(`game:${normalizedCode}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'games',
            filter: `code=eq.${normalizedCode}`
          },
          (payload) => {
            try {
              const newData = payload.new;
              if (newData && newData.state) {
                // Validate state before calling callback
                if (isValidSerializedState(newData.state)) {
                  const state = deserializeState(newData.state);
                  const metadata = newData.metadata || {};
                  callback(state, metadata);
                } else {
                  console.warn(`[SupabaseAdapter.${operation}] Received invalid state update for game "${normalizedCode}"`);
                }
              }
            } catch (error) {
              console.error(`[SupabaseAdapter.${operation}] Error processing real-time update for game "${normalizedCode}":`, error.message);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.info(`[SupabaseAdapter.${operation}] Subscribed to real-time updates for game "${normalizedCode}"`);
          } else if (status === 'CHANNEL_ERROR') {
            console.error(`[SupabaseAdapter.${operation}] Error subscribing to game "${normalizedCode}"`);
          }
        });
      
      this.activeSubscriptions.set(normalizedCode, channel);
    }).catch((error) => {
      console.error(`[SupabaseAdapter.${operation}] Failed to initialize before subscribing:`, error.message);
    });
    
    // Return unsubscribe function
    return () => {
      this._unsubscribeFromGame(normalizedCode);
    };
  }

  /**
   * Unsubscribe from real-time updates for a game
   * 
   * @param {string} code - Game code
   * @private
   */
  _unsubscribeFromGame(code) {
    const normalizedCode = this._normalizeCode(code);
    const channel = this.activeSubscriptions.get(normalizedCode);
    
    if (channel) {
      this.supabase.removeChannel(channel);
      this.activeSubscriptions.delete(normalizedCode);
      console.info(`[SupabaseAdapter] Unsubscribed from real-time updates for game "${normalizedCode}"`);
    }
  }

  /**
   * Cleanup: Unsubscribe from all active subscriptions
   * Call this when the adapter is no longer needed (e.g., component unmount)
   */
  cleanup() {
    for (const [code, channel] of this.activeSubscriptions.entries()) {
      this.supabase.removeChannel(channel);
    }
    this.activeSubscriptions.clear();
    console.info('[SupabaseAdapter] Cleaned up all subscriptions');
  }
}
