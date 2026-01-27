import React from "react";
import { ContractDisplay } from "./ContractDisplay";

// Contracts List Component
export function ContractsList({ G, ctx, type = "market", playerID = null }) {
  function compareContractsFn(a, b) {
    const aValue = (a.type === "market" ? 10 : 0) + (a.fulfilled ? 100 : 0);
    const bValue = (b.type === "market" ? 10 : 0) + (b.fulfilled ? 100 : 0);
    if (aValue < bValue) return -1;
    if (aValue > bValue) return 1;
    return 0;
  }

  const filteredContracts = (
    type === "market" ?
    G.contracts.filter(contract => contract.type === "market" && !contract.fulfilled) :
    G.contracts.filter(contract => contract.playerID === playerID)
  );

  return <div className="contractsList">
    {filteredContracts.toSorted(compareContractsFn).map((contract, index) => (
      <ContractDisplay key={index} contract={contract} ctx={ctx} />
    ))}
  </div>
}
