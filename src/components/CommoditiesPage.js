import React from "react";
import { commodities } from "../data";
import { useGame } from "../hooks/useGame";
import { CommodityRichName } from "./CommodityRichName";

// Helper function
function formatCommodityCityList(items) {
  return items.toString().replaceAll(',', ', ');
}

/**
 * Page component displaying all commodities, split into two sections:
 * commodities that appear in active contracts, and all other commodities.
 * 
 * @component
 * 
 * @example
 * <CommoditiesPage />
 */
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
          <CommodityRichName commodity={key} />
        </div>
        <div className="commodityRow__cities">{formatCommodityCityList(value.cities)}</div>
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
