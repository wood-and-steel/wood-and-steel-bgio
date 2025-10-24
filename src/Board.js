import React from "react";
import { TopButtonBar } from "./components/TopButtonBar";
import { PlayerBoard } from "./components/PlayerBoard";
import { MarketContracts } from "./components/MarketContracts";
import { IndependentRailroads } from "./components/IndependentRailroads";
import { ReferenceTables } from "./components/ReferenceTables";

// Main Component
export function WoodAndSteelState({ ctx, G, moves, playerID, gameManager }) {
  // React hooks must be at the top of the component
  const [input, setInput] = React.useState('');
  const [cityInput, setCityInput] = React.useState('');
  const [showGameList, setShowGameList] = React.useState(false);
  const [showSwitchDialog, setShowSwitchDialog] = React.useState(false);
  const [switchCode, setSwitchCode] = React.useState('');
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [deleteCode, setDeleteCode] = React.useState('');

  const startingContractExists = G.contracts.filter(contract => contract.playerID === playerID).length > 0;
  const currentPhase = ctx.phase;

  // Handler functions for dialogs
  const handleSwitchGame = () => {
    if (gameManager && switchCode) {
      const normalized = gameManager.normalizeGameCode(switchCode);
      if (gameManager.isValidGameCode(normalized)) {
        gameManager.onSwitchGame(normalized);
      } else {
        alert('Please enter a valid 4-letter game code.');
      }
    }
    setShowSwitchDialog(false);
  };

  const handleCancelSwitch = () => {
    setShowSwitchDialog(false);
    setSwitchCode('');
  };

  const handleDeleteGame = () => {
    if (gameManager && deleteCode) {
      const normalized = gameManager.normalizeGameCode(deleteCode);
      if (gameManager.isValidGameCode(normalized)) {
        if (window.confirm(`Are you sure you want to delete game "${normalized}"?`)) {
          if (gameManager.onDeleteGame(normalized)) {
            alert(`Game "${normalized}" deleted successfully.`);
          } else {
            alert(`Failed to delete game "${normalized}".`);
          }
        }
      } else {
        alert('Please enter a valid 4-letter game code.');
      }
    }
    setShowDeleteDialog(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setDeleteCode('');
  };

  function handleSubmit(e) {
    // Prevent the browser from reloading the page
    e.preventDefault();

    const inputParameters = input.split(',').map(i => i.trim());

    switch (e.nativeEvent.submitter.name) {
      case "startingContract":
        moves.generateStartingContract(inputParameters);
        setInput("");
        break;
      case "privateContract":
        moves.generatePrivateContract();
        break;
      case "marketContract":
        moves.generateMarketContract();
        break;
      case "manualContract":
        moves.addManualContract(inputParameters[0], inputParameters[1], inputParameters[2]);
        break;
      case "toggleContractFulfilled":
        moves.toggleContractFulfilled(e.nativeEvent.submitter.id);
        break;
      case "deleteContract":
        const contractIndex = G.contracts.findIndex(c => c.id === e.nativeEvent.submitter.id);
        const contract = G.contracts[contractIndex];
        if (window.confirm(`Delete "${contract.commodity} to ${contract.destinationKey}?"`)) {
            setInput(`${contract.commodity}, ${contract.destinationKey}, ${contract.type}`); 
            moves.deleteContract(e.nativeEvent.submitter.id);
        }
        break;
      case "acquireIndependentRailroad":
        const railroadName = e.nativeEvent.submitter.id;
        const railroad = G.independentRailroads[railroadName];
        if (railroad && window.confirm(`Is the current player buying ${railroad.name}?`)) {
          moves.acquireIndependentRailroad(railroadName);
        }
        break;
      case "endTurn":
        moves.endTurn();
        break;
      case "newGame":
        if (window.confirm("Are you sure you want to start a new game? All progress will be lost.")) {
          if (gameManager) {
            gameManager.onNewGame();
          } else {
            // Fallback to old behavior
            localStorage.clear();
            window.location.reload();
          }
        }
        break;
      case "showGameList":
        setShowGameList(!showGameList);
        break;
      case "showSwitchDialog":
        setShowSwitchDialog(true);
        setSwitchCode('');
        break;
      case "showDeleteDialog":
        setShowDeleteDialog(true);
        setDeleteCode('');
        break;
      default:
        break;
    }
  }

  // Render different UI based on phase
  if (currentPhase === 'scoring') {
    return (
      <div className="boardPage" style={{display: (ctx.currentPlayer === playerID ? "block" : "none")}}>
        <form className="form" method="post" onSubmit={handleSubmit}>
          <TopButtonBar 
            input={input} 
            setInput={setInput} 
            cityInput={cityInput} 
            setCityInput={setCityInput}
            startingContractExists={startingContractExists}
            currentPhase={currentPhase}
            G={G}
            gameManager={gameManager}
          />
          <div style={{ padding: "5rem 2rem", textAlign: "center" }}>
            <h1>Scoring Phase</h1>
            <p>Game scoring will be implemented here.</p>
          </div>
        </form>
        {showGameList && gameManager && <GameListDialog gameManager={gameManager} onClose={() => setShowGameList(false)} />}
        {showSwitchDialog && <GameSwitchDialog switchCode={switchCode} setSwitchCode={setSwitchCode} onSwitch={handleSwitchGame} onCancel={handleCancelSwitch} />}
        {showDeleteDialog && <GameDeleteDialog deleteCode={deleteCode} setDeleteCode={setDeleteCode} onDelete={handleDeleteGame} onCancel={handleCancelDelete} />}
      </div>
    );
  }

  return (
    <div className="boardPage" style={{display: (ctx.currentPlayer === playerID ? "block" : "none")}}>
      <form className="form" method="post" onSubmit={handleSubmit}>
        <div>
          <TopButtonBar 
            input={input} 
            setInput={setInput} 
            cityInput={cityInput} 
            setCityInput={setCityInput}
            startingContractExists={startingContractExists}
            currentPhase={currentPhase}
            G={G}
            gameManager={gameManager}
          />
          <PlayerBoard G={G} ctx={ctx} startingContractExists={startingContractExists} />
        </div>
        {/* Only show market contracts and independent railroads during play phase */}
        {currentPhase === 'play' && <MarketContracts G={G} ctx={ctx} />}
        {currentPhase === 'play' && <IndependentRailroads G={G} />}
        <ReferenceTables G={G} />
      </form>
      {showGameList && gameManager && <GameListDialog gameManager={gameManager} onClose={() => setShowGameList(false)} />}
      {showSwitchDialog && <GameSwitchDialog switchCode={switchCode} setSwitchCode={setSwitchCode} onSwitch={handleSwitchGame} onCancel={handleCancelSwitch} />}
      {showDeleteDialog && <GameDeleteDialog deleteCode={deleteCode} setDeleteCode={setDeleteCode} onDelete={handleDeleteGame} onCancel={handleCancelDelete} />}
    </div>
  );
}

// Game List Dialog Component
function GameListDialog({ gameManager, onClose }) {
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

// Game Switch Dialog Component
function GameSwitchDialog({ switchCode, setSwitchCode, onSwitch, onCancel }) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && switchCode && switchCode.length === 4) {
      onSwitch();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

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
        maxWidth: '400px',
        width: '90%'
      }}>
        <h2 style={{ marginTop: 0 }}>Switch Game</h2>
        <p>Enter the 4-letter code of the game you want to switch to:</p>
        <input
          type="text"
          value={switchCode}
          onChange={e => setSwitchCode(e.target.value.toUpperCase())}
          onKeyDown={handleKeyPress}
          placeholder="ABCD"
          maxLength={4}
          style={{
            width: '100%',
            padding: '0.5rem',
            fontSize: '1.2rem',
            textTransform: 'uppercase',
            marginBottom: '1rem'
          }}
          autoFocus
        />
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button 
            type="button"
            onClick={onCancel}
            className="button"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={onSwitch}
            className="button"
            disabled={!switchCode || switchCode.length !== 4}
          >
            Switch
          </button>
        </div>
      </div>
    </div>
  );
}

// Game Delete Dialog Component
function GameDeleteDialog({ deleteCode, setDeleteCode, onDelete, onCancel }) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && deleteCode && deleteCode.length === 4) {
      onDelete();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

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
        maxWidth: '400px',
        width: '90%'
      }}>
        <h2 style={{ marginTop: 0 }}>Delete Game</h2>
        <p>Enter the 4-letter code of the game you want to delete:</p>
        <input
          type="text"
          value={deleteCode}
          onChange={e => setDeleteCode(e.target.value.toUpperCase())}
          onKeyDown={handleKeyPress}
          placeholder="ABCD"
          maxLength={4}
          style={{
            width: '100%',
            padding: '0.5rem',
            fontSize: '1.2rem',
            textTransform: 'uppercase',
            marginBottom: '1rem'
          }}
          autoFocus
        />
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button 
            type="button"
            onClick={onCancel}
            className="button"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={onDelete}
            className="button"
            disabled={!deleteCode || deleteCode.length !== 4}
            style={{ backgroundColor: '#d32f2f', color: 'white' }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
