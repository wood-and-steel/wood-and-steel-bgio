import React from "react";

// Game List Dialog Component
export function GameListDialog({ gameManager, onClose }) {
  const games = gameManager.onListGames();
  const currentCode = gameManager.currentGameCode;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h2 style={{ marginTop: 0 }}>All Games</h2>
        {games.length === 0 ? (
          <p>No games found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ccc' }}>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Code</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Phase</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Turn</th>
              </tr>
            </thead>
            <tbody>
              {games.map(game => (
                <tr key={game.code} style={{
                  backgroundColor: game.code === currentCode ? '#e6f3ff' : 'transparent',
                  borderBottom: '1px solid #eee'
                }}>
                  <td style={{ padding: '0.5rem', fontWeight: game.code === currentCode ? 'bold' : 'normal' }}>
                    {game.code}
                    {game.code === currentCode && ' (current)'}
                  </td>
                  <td style={{ padding: '0.5rem' }}>{game.phase}</td>
                  <td style={{ padding: '0.5rem' }}>{game.turn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button 
          onClick={onClose}
          className="button"
          style={{ marginTop: '1rem' }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
