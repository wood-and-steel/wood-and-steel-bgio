import React from "react";
import { rewardValue, railroadTieValue } from "../Contract";
import { CommodityRichName } from "./CommodityRichName";
import { contractTieIcons } from "../shared/assets/icons";

function formatContractTieValue(contract) {
  const ties = railroadTieValue(contract);
  return <img className="contract__tieIcon" src={contractTieIcons[ties]} alt={`${ties} ${ties > 1 ? "railroad ties" : "railroad tie"}`} />; 
}

export function ContractDisplay({ contract }) {
  const classes = [
    "contract",
    contract.type === "market" ? "contract--market" : "contract--private",
    contract.fulfilled ? "contract--fulfilled" : ""
  ].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <div className="contract__header">
        {formatContractTieValue(contract)}
        <div className="contract__rewardValue">
          ${rewardValue(contract)/1000}K
        </div>
      </div>
      <div className="contract__body">
        <CommodityRichName commodity={contract.commodity} />
        <div className="contract__destination">
          to {contract.destinationKey}
        </div>
        <button 
          className="contract__fulfillButton"
          id={contract.id} 
          name="toggleContractFulfilled"
        >
          Fulfill
        </button>
      <button 
          className={`deleteButton ${contract.fulfilled ? 'hidden' : ''}`}
          id={contract.id} 
          name="deleteContract"
        >✕</button>
      </div>
    </div>
  );
}
