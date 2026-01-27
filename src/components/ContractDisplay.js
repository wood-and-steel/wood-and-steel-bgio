import React from "react";
import { rewardValue, railroadTieValue } from "../Contract";
import { CommodityRichName } from "./CommodityRichName";

function getContractValue(contract) {
  const ties = railroadTieValue(contract);
  return `$${rewardValue(contract)/1000}K + ${ties} ${ties > 1 ? "RR ties" : "RR tie"}`;
}

function isContractEnabled(contract, ctx) {
  return contract.playerID === ctx.currentPlayer || 
         (contract.type === "market" && (!contract.fulfilled || contract.playerID === ctx.currentPlayer));
}

// Contract Component
export function Contract({ contract, ctx, onToggle, onDelete }) {
  const enabled = isContractEnabled(contract, ctx);
  const classes = [
    'contract',
    contract.fulfilled ? 'contract--fulfilled' : '',
    contract.type === 'market' ? 'contract--market' : 'contract--private'
  ].filter(Boolean).join(' ');
  
  const value = getContractValue(contract);

  return (
    <div className={classes}>
      <button 
        className="contract__fulfillButton"
        id={contract.id} 
        name="toggleContractFulfilled"
        onClick={onToggle}
        disabled={!enabled}
      >
        Fulfill
      </button>
      <CommodityRichName commodity={contract.commodity} />
      <div>
        to
      </div>   
      <div>
        {contract.destinationKey}
      </div>
      <div>
        {value}
      </div>
      <button 
        className={`deleteButton ${contract.fulfilled ? 'hidden' : ''}`}
        id={contract.id} 
        name="deleteContract"
        onClick={onDelete}
      >✕</button>
    </div>
  );
}
