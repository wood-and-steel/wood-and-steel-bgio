import React from "react";

// Game List Dialog Component
export function GameListDialog({ gameManager, onClose }) {
  const [games, setGames] = React.useState(gameManager.onListGames());
  const currentCode = gameManager.currentGameCode;

  const handleNewGame = () => {
    gameManager.onNewGame();
  };
  
  const handleRowClick = (gameCode) => {
    if (gameCode !== currentCode && gameManager) {
      gameManager.onSwitchGame(gameCode);
    }
  };

  const handleDeleteGame = (gameCode, event) => {
    // Stop event propagation to prevent row click
    event.stopPropagation();
    
    if (window.confirm(`Are you sure you want to delete game "${gameCode}"?`)) {
      if (gameManager.onDeleteGame(gameCode)) {
        // Update the games list after successful deletion
        setGames(gameManager.onListGames());
      } else {
        alert(`Failed to delete game "${gameCode}".`);
      }
    }
  };

  return (
    <>
      <div className="modal">
        <div className="modal__content">
          <h2 className="modal__title">All Games</h2>
          {games.length === 0 ? (
            <p>No games found.</p>
          ) : (
            <table className="table">
              <thead>
                <tr className="table__header">
                  <th className="table__headerCell">Code</th>
                  <th className="table__headerCell">Phase</th>
                  <th className="table__headerCell">Turn</th>
                  <th className="table__headerCell">Players</th>
                  <th className="table__headerCell">Delete</th>
                </tr>
              </thead>
              <tbody>
                {games.map(game => (
                  <tr 
                    key={game.code} 
                    className={`table__row ${game.code === currentCode ? 'table__row--current' : ''}`}
                    onClick={() => handleRowClick(game.code)}
                  >
                    <td className={`table__cell ${game.code === currentCode ? 'table__cell--bold' : ''}`}>
                      {game.code}
                      {game.code === currentCode && ' (current)'}
                    </td>
                    <td className="table__cell">{game.phase}</td>
                    <td className="table__cell">{game.turn}</td>
                    <td className="table__cell">{game.playerNames?.join(', ') || 'N/A'}</td>
                    <td className="table__cell table__cell--delete">
                      {game.code !== currentCode && (
                        <button 
                          className="button button--icon button--danger"
                          onClick={(e) => handleDeleteGame(game.code, e)}
                          aria-label={`Delete game ${game.code}`}
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="modal__actions">
            <button 
              onClick={handleNewGame}
              className="button"
            >
              New Game
            </button>
            <button 
              onClick={onClose}
              className="button button--auto-margin"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
