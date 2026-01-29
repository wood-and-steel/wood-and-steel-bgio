import React from "react";
import { ContractDisplay } from "./ContractDisplay";

const SKIP_OPEN_MS = 50;
/**
 * @typedef {object} ContractsListProps
 * @property {object} G - The game state object containing contracts.
 * @property {object} ctx - The game context.
 * @property {'market'|'private'|'fulfilled'} [type='market'] - Which contracts to show.
 * @property {string|null} [playerID=null] - The player whose contracts to show.
 * @property {function} onToggleFulfilled - Called when a contract is toggled.
 * @property {function} onDelete - Called when a contract is deleted.
 */

/**
 * Displays a list of Contract cards, either market or player-specific.
 * 
 * @component
 * @param {ContractsListProps} props
 * 
 * @example
 * <ContractsList
 *   G={G}
 *   ctx={ctx}
 *   type="market"
 *   onToggleFulfilled={fn}
 *   onDelete={fn}
 * />
 */

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
  const isPlayerTurn = playerID == null ? true : playerID === ctx.currentPlayer;

  React.useEffect(() => {
    if (!isPlayerTurn) {
      setOpenContractId(null);
    }
  }, [isPlayerTurn]);

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
      : type === "private"
      ? G.contracts.filter((c) => c.playerID === playerID && !c.fulfilled)
      : G.contracts.filter((c) => c.playerID === playerID && c.fulfilled)
  );

  return (
    <div className="contractsList">
      {filteredContracts.toSorted(compareContractsFn).map((contract) => (
        <ContractDisplay
          key={contract.id}
          contract={contract}
          isMenuOpen={openContractId === contract.id}
          onCardClick={isPlayerTurn ? () => handleCardClick(contract.id) : null}
          onClose={() => setOpenContractId(null)}
          onCloseOutside={handleMenuCloseOutside}
          onToggleFulfilled={onToggleFulfilled}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
