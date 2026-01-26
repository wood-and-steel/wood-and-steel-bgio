import React from "react";
import { commodities } from "../data";
import { commodityIcons } from "../shared/assets/icons";
import { useGame } from "../hooks/useGame";

// Helper function
function formatCommodityList(items) {
  return items.toString().replaceAll(',', ', ');
}

// Helper function to capitalize first letter
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Commodities Page Component
export function CommoditiesPage() {
  const { G, ctx } = useGame();

  // Get commodities that are in contracts
  // 1. Active player's not-fulfilled private contracts
  // 2. Active market contracts (not fulfilled)
  const commoditiesInContracts = new Set();
  
  G.contracts.forEach(contract => {
    if (
      // Active player's not-fulfilled private contracts
      (contract.playerID === ctx.currentPlayer && 
       contract.type === 'private' && 
       !contract.fulfilled) ||
      // Active market contracts
      (contract.type === 'market' && !contract.fulfilled)
    ) {
      commoditiesInContracts.add(contract.commodity);
    }
  });

  // Split commodities into two lists
  const inContractsList = [];
  const othersList = [];

  [...commodities].forEach(([key, value]) => {
    const commodityRow = (
      <div key={key} className="commodityRow">
        <div className="commodityRow__header">
          <img src={commodityIcons[key]} alt={key} className="commodityRow__icon" />
          <span>{capitalizeFirst(key)}</span>
        </div>
        <div className="commodityRow__cities">{formatCommodityList(value.cities)}</div>
      </div>
    );

    if (commoditiesInContracts.has(key)) {
      inContractsList.push(commodityRow);
    } else {
      othersList.push(commodityRow);
    }
  });

  return (
    <div className="pageContent">
      <div className="referenceTable commodityTable">
        <div>
          <h3 className="commoditySection__title">In contracts</h3>
          {inContractsList.length > 0 ? (
            <div>{inContractsList}</div>
          ) : (
            <div className="commoditySection__empty">No commodities in contracts</div>
          )}
        </div>
        <div>
          <h3 className="commoditySection__title">Others</h3>
          {othersList.length > 0 ? (
            <div>{othersList}</div>
          ) : (
            <div className="commoditySection__empty">No other commodities</div>
          )}
        </div>
      </div>
    </div>
  );
}
