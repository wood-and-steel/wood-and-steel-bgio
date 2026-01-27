import React from "react";
import { ContractDisplay } from "./ContractDisplay";

const SKIP_OPEN_MS = 50;

export function ContractsList({
  G,
  ctx,
  type = "market",
  playerID = null,
  onToggleFulfilled,
  onDelete,
}) {
  const [openContractId, setOpenContractId] = React.useState(null);
  const [skipNextContractOpenUntil, setSkipNextContractOpenUntil] = React.useState(0);

  const handleCardClick = React.useCallback((id) => {
    if (Date.now() < skipNextContractOpenUntil) {
      setSkipNextContractOpenUntil(0);
      return;
    }
    setOpenContractId((prev) => (prev === id ? null : id));
  }, [skipNextContractOpenUntil]);

  const handleMenuCloseOutside = React.useCallback(() => {
    setSkipNextContractOpenUntil(Date.now() + SKIP_OPEN_MS);
  }, []);

  function compareContractsFn(a, b) {
    const aValue = (a.type === "market" ? 10 : 0) + (a.fulfilled ? 100 : 0);
    const bValue = (b.type === "market" ? 10 : 0) + (b.fulfilled ? 100 : 0);
    if (aValue < bValue) return -1;
    if (aValue > bValue) return 1;
    return 0;
  }

  const filteredContracts = (
    type === "market"
      ? G.contracts.filter((c) => c.type === "market" && !c.fulfilled)
      : G.contracts.filter((c) => c.playerID === playerID)
  );

  return (
    <div className="contractsList">
      {filteredContracts.toSorted(compareContractsFn).map((contract) => (
        <ContractDisplay
          key={contract.id}
          contract={contract}
          isMenuOpen={openContractId === contract.id}
          onCardClick={() => handleCardClick(contract.id)}
          onClose={() => setOpenContractId(null)}
          onCloseOutside={handleMenuCloseOutside}
          onToggleFulfilled={onToggleFulfilled}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
