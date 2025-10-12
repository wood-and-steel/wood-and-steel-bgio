import React from "react";
import { ContractsList } from "./ContractsList";

// Market Contracts Component
export function MarketContracts({ G, ctx }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", margin: "auto", padding: "0.5rem" }}>
      <div style={{fontWeight: "bold", width: "18rem", paddingBottom: "0.25rem"}}>Market contracts</div>
      <button name="marketContract" className="button">Generate Market Contract</button>
      <ContractsList G={G} ctx={ctx} type="market" />
    </div>
  );
}
