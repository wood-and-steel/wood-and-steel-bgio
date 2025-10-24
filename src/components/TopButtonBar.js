import React from "react";

// Available starting city pairs
const STARTING_CITY_PAIRS = [
  ["Quebec City", "Montreal"],
  ["Boston", "Portland ME"],
  ["Philadelphia", "New York"],
  ["Washington", "Philadelphia"],
  ["Raleigh", "Norfolk"],
  ["Charleston", "Savannah"]
];

// Top Button Bar Component
export function TopButtonBar({ input, setInput, cityInput, setCityInput, startingContractExists, currentPhase, G, gameManager, onShowGameList }) {
  // Get available starting pairs (filter out already chosen ones)
  const getAvailableStartingPairs = () => {
    if (currentPhase !== 'setup') return STARTING_CITY_PAIRS;
    
    // Get all starting cities that have been chosen
    const chosenCities = new Set();
    G.players.forEach(([id, player]) => {
      player.activeCities.forEach(city => chosenCities.add(city));
    });
    
    // Filter out pairs where any city has been chosen
    return STARTING_CITY_PAIRS.filter(pair => 
      !chosenCities.has(pair[0]) && !chosenCities.has(pair[1])
    );
  };
  
  const availablePairs = getAvailableStartingPairs();
  
  return (
    <div className="buttonBar" style={{ backgroundColor: "#606060", padding: "0.75em", position: "fixed", top: "0", left: "0", right: "0"}}>
      {/* Game code display - clickable to open game list */}
      {gameManager && (
        <span 
          onClick={onShowGameList}
          style={{ 
            color: "white", 
            fontWeight: "bold", 
            fontSize: "110%", 
            marginRight: "1.5rem",
            padding: "0.25rem 0.75rem",
            backgroundColor: "#404040",
            borderRadius: "4px",
            cursor: "pointer",
            userSelect: "none"
          }}
          title="Click to view all games"
        >
          Game: {gameManager.currentGameCode}
        </span>
      )}

      {/* End turn button - not shown during setup (auto-advances) */}
      <button 
        name="endTurn" 
        className="button" 
        style={{ display: currentPhase === 'play' ? 'inline-block' : 'none' }}
      >End Turn</button>

      <div style={{ display: "inline" }}>
        <span style={{ 
          color: "white", paddingLeft: "1.5rem", fontSize: "90%",
          display: currentPhase === 'setup' ? "block" : "none",
        }}>
          <b>Choose starting cities:</b>
        </span>
        <span style={{ 
          color: "white", paddingLeft: "1.5rem", fontSize: "90%",
          display: currentPhase === 'play' ? "block" : "none",
        }}>
          <b>Manual</b> commodity, destination, type:
        </span>
      </div>
      
      {/* Dropdown for setup phase */}
      {currentPhase === 'setup' && (
        <select
          value={input}
          onChange={e => setInput(e.target.value)}
          name="startingPairSelector"
          style={{
            width: "15rem",
            height: "24px",
            marginLeft: "0.5rem"
          }}
        >
          <option value="">-- Select a pair --</option>
          {availablePairs.map((pair, index) => (
            <option key={index} value={pair.join(', ')}>
              {pair.join(' & ')}
            </option>
          ))}
        </select>
      )}
      
      {/* Text input for play phase */}
      <input 
        value={input}
        onChange={e => setInput(e.target.value)}
        name="inputParameters" 
        style={{
          width: "15rem", 
          height: "20px",
          display: currentPhase === 'play' ? 'inline-block' : 'none'
        }} 
      />
      
      <button 
        name="startingContract" 
        className="button"
        style={{ display: currentPhase === 'setup' ? "inline-block" : "none" }}
        disabled={!input || currentPhase !== 'setup'}
      >Choose Starting Cities</button>
      <button 
        name="manualContract" 
        className="button"
        style={{ display: currentPhase === 'play' ? "block" : "none" }}
      >Manual Contract</button>

      <div style={{ display: currentPhase === 'play' ? "inline" : "none" }}>
        <span style={{ color: "white", paddingLeft: " 1.5rem", fontSize: "90%" }}><b>Cities:</b></span>
        <input 
          value={cityInput}
          onChange={e => setCityInput(e.target.value)}
          name="cityList" 
          style={{width: "8rem", height: "20px", margin: "0 0.5rem"}} 
        />
        <button name="addCities" className="button">Add Cities</button>
      </div>
    </div>
  );
}
