import React from 'react';
import { GameProvider } from '../providers/GameProvider';
import { WoodAndSteelState } from '../Board';
import { useGameStore } from '../stores/gameStore';
import { 
  getCurrentGameCode, 
  createNewGame,
  gameExists,
  listGames,
  deleteGame,
  switchToGame,
  isValidGameCode,
  normalizeGameCode,
  loadGameState
} from '../utils/gameManager';

const App = () => {
  // Get or create game code
  const [currentGameCode, setCurrentGameCodeState] = React.useState(() => {
    try {
      let code = getCurrentGameCode();
      
      // If no current game or it doesn't exist, create a new one
      if (!code || !gameExists(code)) {
        code = createNewGame();
      }
      
      return code;
    } catch (error) {
      console.error('[App] Error initializing game code:', error.message);
      // Return a fallback code - will be handled in useEffect
      return null;
    }
  });

  // Load game state on mount
  React.useEffect(() => {
    const code = getCurrentGameCode();
    
    // Handle case where no game code exists
    if (!code) {
      try {
        const newCode = createNewGame();
        setCurrentGameCodeState(newCode);
        console.info('[App] Created new game after initialization failure');
      } catch (error) {
        console.error('[App] Critical: Unable to create game:', error.message);
        alert('Unable to initialize the game. Please refresh the page. If the problem persists, try clearing your browser\'s localStorage.');
      }
      return;
    }
    if (code && gameExists(code)) {
      try {
        const savedState = loadGameState(code);
        if (savedState) {
          // Validate loaded state has required structure
          if (savedState.G && savedState.ctx) {
            // Load state into Zustand store
            useGameStore.setState({
              G: savedState.G,
              ctx: savedState.ctx
            });
            console.info('[App] Successfully loaded game state for:', code);
          } else {
            console.warn('[App] Loaded state missing required structure (G or ctx), creating new game');
            // Fallback: create new game if state is invalid
            const newCode = createNewGame();
            setCurrentGameCodeState(newCode);
            // State will be initialized by the game setup
          }
        } else {
          console.info('[App] No saved state found, starting fresh game');
          // State will be initialized by the game setup
        }
      } catch (error) {
        console.error('[App] Error loading game state:', error.message);
        console.error('[App] Error details:', error);
        // Fallback: create new game if load fails
        try {
          const newCode = createNewGame();
          setCurrentGameCodeState(newCode);
          console.info('[App] Created new game as fallback after load error');
        } catch (fallbackError) {
          console.error('[App] Failed to create fallback game:', fallbackError.message);
          // Last resort: show user-friendly error
          alert('Unable to load or create a game. Please refresh the page. If the problem persists, try clearing your browser\'s localStorage.');
        }
      }
    } else {
      console.info('[App] No current game or game does not exist, starting fresh');
      // State will be initialized by the game setup
    }
    // Note: State saving happens automatically after moves in gameActions.js
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount - currentGameCode is handled in initial state

  // Pass game management functions to the board through context
  const gameManager = {
    currentGameCode,
    onNewGame: () => {
      try {
        const newCode = createNewGame();
        setCurrentGameCodeState(newCode);
        // Force page reload to reset the game state
        window.location.reload();
      } catch (error) {
        console.error('[App] Error creating new game:', error.message);
        alert(`Unable to create a new game. ${error.message || 'Please try again or refresh the page.'}`);
      }
    },
    onSwitchGame: (code) => {
      try {
        if (switchToGame(code)) {
          setCurrentGameCodeState(normalizeGameCode(code));
          // Force page reload to switch the game
          window.location.reload();
        } else {
          alert(`Game "${code}" not found. Please check the code and try again.`);
        }
      } catch (error) {
        console.error('[App] Error switching game:', error.message);
        alert(`Unable to switch to game "${code}". ${error.message || 'Please try again.'}`);
      }
    },
    onDeleteGame: (code) => {
      try {
        if (deleteGame(code)) {
          // If we deleted the current game, create a new one
          if (normalizeGameCode(code) === currentGameCode) {
            try {
              const newCode = createNewGame();
              setCurrentGameCodeState(newCode);
              window.location.reload();
            } catch (createError) {
              console.error('[App] Error creating new game after deletion:', createError.message);
              alert('Game deleted, but unable to create a new game. Please refresh the page.');
            }
          }
          return true;
        }
        return false;
      } catch (error) {
        console.error('[App] Error deleting game:', error.message);
        alert(`Unable to delete game "${code}". ${error.message || 'Please try again.'}`);
        return false;
      }
    },
    onListGames: () => {
      return listGames();
    },
    isValidGameCode,
    normalizeGameCode
  };

  return (
    <div>
      <GameProvider playerID="0">
        <WoodAndSteelState gameManager={gameManager} />
      </GameProvider>
      <GameProvider playerID="1">
        <WoodAndSteelState gameManager={gameManager} />
      </GameProvider>
    </div>
  );
};

export default App;
