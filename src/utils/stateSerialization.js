/**
 * State serialization utilities for game state persistence
 * 
 * Provides functions to serialize and deserialize game state (G) and context (ctx)
 * for persistence purposes (localStorage, server sync, etc.)
 */

/**
 * Serialize game state (G) and context (ctx) to a JSON-serializable format
 * 
 * This performs a deep clone of the state, ensuring all nested structures
 * are properly serialized. The result can be safely passed to JSON.stringify().
 * 
 * @param {Object} G - Game state object
 * @param {Object} ctx - Game context object
 * @returns {Object} Serialized state object with structure { G: {...}, ctx: {...} }
 */
export function serializeState(G, ctx) {
  if (!G || typeof G !== 'object') {
    throw new Error('serializeState: G must be a valid object');
  }
  if (!ctx || typeof ctx !== 'object') {
    throw new Error('serializeState: ctx must be a valid object');
  }

  // Deep clone G structure
  const serializedG = {
    contracts: deepClone(G.contracts || []),
    players: deepClone(G.players || []),
    independentRailroads: deepClone(G.independentRailroads || {}),
  };

  // Deep clone ctx, excluding internal properties (prefixed with underscore)
  const serializedCtx = {};
  for (const [key, value] of Object.entries(ctx)) {
    // Skip internal properties
    if (key.startsWith('_')) {
      continue;
    }
    serializedCtx[key] = deepClone(value);
  }

  return {
    G: serializedG,
    ctx: serializedCtx,
  };
}

/**
 * Deserialize game state from a serialized data object
 * 
 * Reconstructs the game state (G) and context (ctx) from serialized data.
 * This performs a deep clone to ensure the returned state is independent
 * of the input data.
 * 
 * @param {Object} data - Serialized state object with structure { G: {...}, ctx: {...} }
 * @returns {{G: Object, ctx: Object}} Deserialized state object
 */
export function deserializeState(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('deserializeState: data must be a valid object');
  }

  const { G, ctx } = data;

  if (!G || typeof G !== 'object') {
    throw new Error('deserializeState: data.G must be a valid object');
  }
  if (!ctx || typeof ctx !== 'object') {
    throw new Error('deserializeState: data.ctx must be a valid object');
  }

  // Deep clone to ensure independence from input data
  return {
    G: {
      contracts: deepClone(G.contracts || []),
      players: deepClone(G.players || []),
      independentRailroads: deepClone(G.independentRailroads || {}),
    },
    ctx: deepClone(ctx),
  };
}

/**
 * Deep clone a value, handling primitives, arrays, objects, and nested structures
 * 
 * This utility function recursively clones nested structures to ensure
 * complete independence from the original data.
 * 
 * @param {*} value - Value to clone
 * @returns {*} Deep cloned value
 */
function deepClone(value) {
  // Handle primitives and null
  if (value === null || typeof value !== 'object') {
    return value;
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(item => deepClone(item));
  }

  // Handle Date objects
  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  // Handle plain objects
  const cloned = {};
  for (const [key, val] of Object.entries(value)) {
    cloned[key] = deepClone(val);
  }
  return cloned;
}

/**
 * Serialize state to JSON string
 * 
 * Convenience function that combines serializeState and JSON.stringify
 * 
 * @param {Object} G - Game state object
 * @param {Object} ctx - Game context object
 * @returns {string} JSON string representation of the state
 */
export function serializeStateToJSON(G, ctx) {
  const serialized = serializeState(G, ctx);
  return JSON.stringify(serialized);
}

/**
 * Deserialize state from JSON string
 * 
 * Convenience function that combines JSON.parse and deserializeState
 * 
 * @param {string} jsonString - JSON string representation of the state
 * @returns {{G: Object, ctx: Object}} Deserialized state object
 */
export function deserializeStateFromJSON(jsonString) {
  if (typeof jsonString !== 'string') {
    throw new Error('deserializeStateFromJSON: jsonString must be a string');
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (error) {
    throw new Error(`deserializeStateFromJSON: Invalid JSON string - ${error.message}`);
  }

  return deserializeState(parsed);
}

/**
 * Validate serialized state structure
 * 
 * Checks if a serialized state object has the expected structure
 * and required fields. Useful for validating data before deserialization.
 * 
 * @param {Object} data - Object to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidSerializedState(data) {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const { G, ctx } = data;

  // Validate G structure
  if (!G || typeof G !== 'object') {
    return false;
  }
  if (!Array.isArray(G.contracts)) {
    return false;
  }
  if (!Array.isArray(G.players)) {
    return false;
  }
  if (!G.independentRailroads || typeof G.independentRailroads !== 'object') {
    return false;
  }

  // Validate ctx structure
  if (!ctx || typeof ctx !== 'object') {
    return false;
  }
  if (typeof ctx.phase !== 'string') {
    return false;
  }
  if (typeof ctx.currentPlayer !== 'string') {
    return false;
  }
  if (typeof ctx.numPlayers !== 'number') {
    return false;
  }
  if (!Array.isArray(ctx.playOrder)) {
    return false;
  }
  if (typeof ctx.playOrderPos !== 'number') {
    return false;
  }
  if (typeof ctx.turn !== 'number') {
    return false;
  }

  return true;
}
