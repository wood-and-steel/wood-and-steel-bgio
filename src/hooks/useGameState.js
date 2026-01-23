import { useGameStore } from '../stores/gameStore';
import * as gameActions from '../stores/gameActions';

/**
 * Custom hook that provides access to the Zustand game store
 * Makes it easy for components to optionally use the new state system
 * instead of relying on bgio props
 * 
 * Components can gradually migrate from bgio props to this hook
 * 
 * @returns {{G: Object, ctx: Object, actions: Object, selectors: Object}}
 *   - G: Game state (mirrors boardgame.io's G)
 *   - ctx: Game context (mirrors boardgame.io's ctx)
 *   - actions: Action functions that mirror the move structure
 *   - selectors: Selector functions for common state access patterns
 * 
 * @example
 * ```jsx
 * function MyComponent() {
 *   const { G, ctx, actions, selectors } = useGameState();
 *   
 *   const myContracts = selectors.getPlayerContracts('0');
 *   const isMyTurn = selectors.isMyTurn('0');
 *   
 *   return (
 *     <button onClick={() => actions.generatePrivateContract()}>
 *       Generate Contract
 *     </button>
 *   );
 * }
 * ```
 */
export function useGameState() {
  // Subscribe to G and ctx from the store
  const G = useGameStore((state) => state.G);
  const ctx = useGameStore((state) => state.ctx);

  // Get selector functions from the store
  const getPlayerContracts = useGameStore((state) => state.getPlayerContracts);
  const getMarketContracts = useGameStore((state) => state.getMarketContracts);
  const getCurrentPlayer = useGameStore((state) => state.getCurrentPlayer);
  const isMyTurn = useGameStore((state) => state.isMyTurn);
  const getPlayerActiveCities = useGameStore((state) => state.getPlayerActiveCities);

  // Get action functions from the store
  const resetState = useGameStore((state) => state.resetState);

  // Organize selectors into an object
  const selectors = {
    getPlayerContracts,
    getMarketContracts,
    getCurrentPlayer,
    isMyTurn,
    getPlayerActiveCities,
  };

  // Organize actions into an object
  // Include both game actions and store management actions
  const actions = {
    // Game actions
    ...gameActions,
    // Store management actions
    resetState,
  };

  return {
    G,
    ctx,
    actions,
    selectors,
  };
}
