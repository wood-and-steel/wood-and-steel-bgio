import React from "react";
import { rewardValue, railroadTieValue } from "../Contract";
import { CommodityRichName } from "./CommodityRichName";
import { contractTieIcons } from "../shared/assets/icons";
import { PopupMenu, PopupMenuItem } from "./PopupMenu";

function formatContractTieValue(contract) {
  const ties = railroadTieValue(contract);
  return (
    <img
      className="contract__tieIcon"
      src={contractTieIcons[ties]}
      alt={`${ties} ${ties > 1 ? "railroad ties" : "railroad tie"}`}
    />
  );
}

export function ContractDisplay({
  contract,
  isMenuOpen,
  onCardClick,
  onClose,
  onCloseOutside,
  onToggleFulfilled,
  onDelete,
}) {
  const cardRef = React.useRef(null);
  const classes = [
    "contract",
    contract.type === "market" ? "contract--market" : "contract--private",
    contract.fulfilled ? "contract--fulfilled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleToggle = () => {
    onToggleFulfilled(contract.id);
    onClose();
  };

  const handleDelete = () => {
    onDelete(contract.id);
    onClose();
  };

  return (
    <>
      <div
        ref={cardRef}
        className={classes}
        role="button"
        tabIndex={0}
        onClick={() => onCardClick()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onCardClick();
          }
        }}
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
      >
        <div className="contract__header">
          {formatContractTieValue(contract)}
          <div className="contract__rewardValue">${rewardValue(contract) / 1000}K</div>
        </div>
        <div className="contract__body">
          <CommodityRichName commodity={contract.commodity} />
          <div className="contract__destination">to {contract.destinationKey}</div>
        </div>
      </div>
      <PopupMenu
        isOpen={isMenuOpen}
        onClose={onClose}
        onCloseOutside={onCloseOutside}
        anchorRef={cardRef}
        placement={{ side: "bottom", align: "center" }}
      >
        <PopupMenuItem onClick={handleToggle}>
          {contract.fulfilled ? "Unfulfill Contract" : "Fulfill Contract"}
        </PopupMenuItem>
        {!contract.fulfilled && (
          <PopupMenuItem onClick={handleDelete}>Delete</PopupMenuItem>
        )}
      </PopupMenu>
    </>
  );
}
