import { create } from 'zustand';
import { initializeIndependentRailroads } from '../independentRailroads';

/**
 * @typedef {Object} Contract
 * @property {string} id - unique ID of the contract
 * @property {string} destinationKey
 * @property {string} commodity
 * @property {boolean} fulfilled
 * @property {string|null} playerID
 * @property {string} type - 'private' or 'market'
 */

/**
 * @typedef {Object} PlayerProps
 * @property {string} name
 * @property {Array<string>} activeCities
 */

/**
 * Initial game state (G) structure
 * @typedef {Object} GameState
 * @property {Array<Contract>} contracts - All contracts in the game
 * @property {Array<[string, PlayerProps]>} players - Array of [playerID, playerData] tuples
 * @property {Object} independentRailroads - Map of railroad name to railroad data
 */

/**
 * Initial context (ctx) structure
 * @typedef {Object} GameContext
 * @property {string} phase - Current phase name ('setup', 'play', 'scoring')
 * @property {string} currentPlayer - ID of player whose turn it is ('0', '1', etc.)
 * @property {number} numPlayers - Total number of players (2)
 * @property {Array<string>} playOrder - Array of player IDs in turn order
 * @property {number} playOrderPos - Index in playOrder for current player
 * @property {number} turn - Current turn number
 */

/**
 * Initial state factory
 * @param {number} numPlayers - Number of players (default: 2)
 * @returns {{G: GameState, ctx: GameContext}}
 */
function getInitialState(numPlayers = 2) {
  const independentRailroads = initializeIndependentRailroads();

  return {
    G: {
      contracts: [],
      players: Array.from({ length: numPlayers }, (_, i) => [
        String(i),
        { name: `Player ${i}`, activeCities: [] }
      ]),
      independentRailroads: independentRailroads,
    },
    ctx: {
      phase: 'setup',
      currentPlayer: '0',
      numPlayers: numPlayers,
      playOrder: Array.from({ length: numPlayers }, (_, i) => String(i)),
      playOrderPos: 0,
      turn: 0,
    }
  };
}

/**
 * Zustand store for game state
 * Mirrors boardgame.io's G and ctx structures
 */
export const useGameStore = create((set, get) => ({
  // Initial state
  ...getInitialState(),

  /**
   * Sync state from boardgame.io Client
   * One-way synchronization: bgio → Zustand
   * @param {GameState} G - Game state from bgio
   * @param {GameContext} ctx - Context from bgio
   */
  syncFromBgio: (G, ctx) => {
    set({
      G: {
        contracts: [...(G.contracts || [])],
        players: (G.players || []).map(([id, props]) => [
          id,
          {
            name: props.name,
            activeCities: [...(props.activeCities || [])]
          }
        ]),
        independentRailroads: { ...(G.independentRailroads || {}) }
      },
      ctx: {
        phase: ctx.phase || 'setup',
        currentPlayer: ctx.currentPlayer || '0',
        numPlayers: ctx.numPlayers || 2,
        playOrder: [...(ctx.playOrder || [])],
        playOrderPos: ctx.playOrderPos || 0,
        turn: ctx.turn || 0,
      }
    });
  },

  /**
   * Reset state to initial values
   * @param {number} numPlayers - Number of players (default: 2)
   */
  resetState: (numPlayers = 2) => {
    set(getInitialState(numPlayers));
  },

  // Selector functions

  /**
   * Get all contracts for a specific player
   * @param {string} playerID - Player ID
   * @returns {Array<Contract>}
   */
  getPlayerContracts: (playerID) => {
    const { G } = get();
    return G.contracts.filter(c => c.playerID === playerID);
  },

  /**
   * Get all market contracts (contracts with type 'market')
   * @returns {Array<Contract>}
   */
  getMarketContracts: () => {
    const { G } = get();
    return G.contracts.filter(c => c.type === 'market');
  },

  /**
   * Get current player data
   * @returns {[string, PlayerProps]|undefined}
   */
  getCurrentPlayer: () => {
    const { G, ctx } = get();
    return G.players.find(([id]) => id === ctx.currentPlayer);
  },

  /**
   * Check if it's a specific player's turn
   * @param {string} playerID - Player ID to check
   * @returns {boolean}
   */
  isMyTurn: (playerID) => {
    const { ctx } = get();
    return ctx.currentPlayer === playerID;
  },

  /**
   * Get active cities for a specific player
   * @param {string} playerID - Player ID
   * @returns {Array<string>}
   */
  getPlayerActiveCities: (playerID) => {
    const { G } = get();
    const player = G.players.find(([id]) => id === playerID);
    return player ? player[1].activeCities : [];
  },
}));
