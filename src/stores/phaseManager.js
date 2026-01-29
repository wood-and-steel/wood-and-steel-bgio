/**
 * Phase management module for Phase 3 (Turn/Phase Management)
 * Handles phase transitions and hook execution
 */

import { useGameStore } from './gameStore';
import { getPhaseConfig, executePhaseOnEnd } from './phaseConfig';
import { getCurrentGameCode, saveGameState } from '../utils/gameManager';

/**
 * Check if the current phase should end and transition to the next phase.
 * This function evaluates the phase's endIf condition and performs the transition
 * if needed, including updating state and executing phase hooks.
 * 
 * @param {Object} G - Current game state
 * @param {Object} ctx - Current game context
 * @returns {boolean} True if a phase transition occurred, false otherwise
 */
export function checkPhaseTransition(G, ctx) {
  // Get current phase configuration
  const currentPhaseConfig = getPhaseConfig(ctx.phase);
  
  if (!currentPhaseConfig) {
    console.warn(`[checkPhaseTransition] Unknown phase: ${ctx.phase}`);
    return false;
  }

  // Evaluate end condition
  const endIfResult = currentPhaseConfig.endIf ? currentPhaseConfig.endIf({ G, ctx }) : false;
  
  if (!endIfResult) {
    // Phase should not end
    return false;
  }

  // Phase should end - transition to next phase
  const nextPhase = currentPhaseConfig.next;
  
  if (!nextPhase) {
    console.warn(`[checkPhaseTransition] Phase ${ctx.phase} has no next phase defined`);
    return false;
  }

  // Execute current phase's onEnd hook before transitioning
  // Note: onEnd hooks may mutate G (though currently none do)
  executePhaseOnEnd(ctx.phase, G, ctx);

  // Update state with new phase
  // Note: We need to update both G and ctx in case the onEnd hook mutated G
  useGameStore.setState((currentState) => ({
    G: {
      ...currentState.G,
      // Ensure G is updated if onEnd hook mutated it
      // We spread currentState.G to get any mutations that may have occurred
    },
    ctx: {
      ...currentState.ctx,
      phase: nextPhase
    }
  }));

  // Save state after phase transition
  const gameCode = getCurrentGameCode();
  if (gameCode) {
    const updatedState = useGameStore.getState();
    saveGameState(gameCode, updatedState.G, updatedState.ctx).catch((error) => {
      console.error('[checkPhaseTransition] Failed to save game state:', error.message);
    });
  }

  console.log(`[checkPhaseTransition] Phase transition: ${ctx.phase} → ${nextPhase}`);
  return true;
}
