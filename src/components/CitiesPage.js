import React from "react";
import { cities } from "../data";
import { valueOfCity } from "../Contract";

// Helper function
function formatCommodityList(items) {
  return items.toString().replaceAll(',', ', ');
}

/**
 * Page component displaying all cities with their values. Highlights cities that are active for the current player.
 * 
 * @component
 * @param {object} props
 * @param {object} props.G - The game state object containing players and their active cities.
 * @param {object} props.ctx - The game context, used to identify the current player.
 * 
 * @example
 * <CitiesPage G={G} ctx={ctx} />
 */
export function CitiesPage({ G, ctx }) {
  // Get current player's active cities
  const currentPlayer = G.players.find(([key]) => key === ctx.currentPlayer);
  const activeCities = currentPlayer ? new Set(currentPlayer[1].activeCities) : new Set();
  
  const cityValues = [...cities].map(([key, value]) => {
    const isActive = activeCities.has(key);
    return (
      <div key={key} className="cityCell">
        <span 
          className={`cityCell__name ${isActive ? 'cityCell__name--active' : ''}`}
          title={value.commodities.length === 0 ? "(no commodities)" : formatCommodityList(value.commodities)}
        >
          {key}
        </span> 
        <span className="cityCell__value">{valueOfCity(G, key)}</span>
      </div>
    );
  });

  return (
    <div className="pageContent">
      <div className="referenceTable cityTable">{cityValues}</div>
    </div>
  );
}
