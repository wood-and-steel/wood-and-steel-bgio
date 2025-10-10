# Phases Implementation

## Overview
The game now uses boardgame.io's phases feature to structure gameplay into three distinct phases.

## Phase Structure

### 1. Setup Phase
- **Purpose**: Each player chooses their starting cities and receives a private contract
- **Flow**: 
  - Players take turns selecting two starting cities
  - Upon selection, a private contract is automatically generated using starting contract logic
  - Player's turn automatically ends after choosing cities
  - Phase ends when all players have at least one private contract
- **UI Changes**:
  - Top bar shows "Phase: Setup"
  - Input field prompts for "city 1, city 2"
  - Button labeled "Choose Starting Cities"
  - No "End Turn" button (auto-advances)
  - Market contracts and independent railroads are hidden
- **Note**: There is no special "starting" contract type. The `generateStartingContract` function uses different business logic to create the contract, but the resulting contract is a regular private contract (type: "private").

### 2. Play Phase
- **Purpose**: Main game with all normal actions
- **Flow**:
  - Players take turns performing game actions
  - End-of-round processing happens after last player's turn
  - Independent railroads grow at end of each round
  - Currently no end condition (game continues indefinitely)
- **UI Changes**:
  - Top bar shows "Phase: Play"
  - All normal game UI is visible
  - "End Turn" button appears
  - Market contracts section visible
  - Independent railroads section visible
  - Manual contract input available

### 3. Scoring Phase
- **Purpose**: Calculate final scores (stub for future implementation)
- **Flow**:
  - Currently unreachable (no code path triggers it)
  - Stub UI shows placeholder message
- **UI Changes**:
  - Top bar shows "Phase: Scoring"
  - Simple centered message: "Game scoring will be implemented here"
  - Most UI elements hidden

## Key Implementation Details

### Game.js Changes
- Removed top-level `moves` and `turn` objects
- Added `phases` object with three phase definitions
- Each phase has its own `moves`, `turn`, and `endIf` configurations
- Setup phase auto-ends when all players have at least one private contract
- Play phase has no automatic end condition yet
- Starting contracts use special generation logic but create regular private contracts (type: "private")

### Board.js Changes
- Added `currentPhase` variable from `ctx.phase`
- Updated `TopButtonBar` to show phase-specific UI
- Added conditional rendering for phase-appropriate components
- Scoring phase shows stub UI

## Future Enhancements

To add a game end condition, modify the Play phase's `endIf`:

```javascript
endIf: ({ G, ctx }) => {
  // Example: End when any player has 10 fulfilled contracts
  const maxFulfilled = Math.max(...G.players.map(([id, props]) => 
    G.contracts.filter(c => c.playerID === id && c.fulfilled).length
  ));
  return maxFulfilled >= 10;
}
```

Then implement the scoring phase logic with appropriate moves and UI.
