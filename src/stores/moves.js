import {
  generateStartingContract,
  generatePrivateContract,
  generateMarketContract,
  addManualContract,
  toggleContractFulfilled,
  deleteContract,
  acquireIndependentRailroad,
  endTurn
} from './gameActions';

/**
 * Moves API object that matches boardgame.io's moves pattern.
 * This allows components to use the same `moves.moveName(args)` API
 * as boardgame.io, but calls the Zustand-based move functions.
 * 
 * @param {Object} store - Zustand store instance (for future flexibility, currently unused)
 * @returns {Object} Object containing all available moves
 */

export const createMoves = (store) => ({
  generateStartingContract: (activeCities) => 
    generateStartingContract(activeCities),
  
  generatePrivateContract: () => 
    generatePrivateContract(),
  
  generateMarketContract: () => 
    generateMarketContract(),
  
  addManualContract: (commodity, destinationKey, type) => 
    addManualContract(commodity, destinationKey, type),
  
  toggleContractFulfilled: (contractID) => 
    toggleContractFulfilled(contractID),
  
  deleteContract: (contractID) => 
    deleteContract(contractID),
  
  acquireIndependentRailroad: (railroadName) => 
    acquireIndependentRailroad(railroadName),
  
  endTurn: () => 
    endTurn()
});
