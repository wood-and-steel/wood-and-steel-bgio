import React from "react";
import { ContractDisplay } from "./ContractDisplay";

const SKIP_OPEN_MS = 50;
/**
 * Displays a list of Contract cards, either market or player-specific.
 * 
 * @component
 * @param {object} props
 * @param {object} props.G - The game state object containing contracts.
 * @param {object} props.ctx - The game context.
 * @param {'market'|'private'|'fulfilled'} [props.type='market'] - Which contracts to show; 'market' shows global market contracts, 'private' shows unfulfilled player-specific contracts, 'fulfilled' shows fulfilled contracts for the player.
 * @param {string|null} [props.playerID=null] - The player whose contracts to show (only relevant if type is 'private' or 'fulfilled').
 * @param {function} props.onToggleFulfilled - Called when a contract's fulfilled state is toggled.
 * @param {function} props.onDelete - Called when a contract is deleted.
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
