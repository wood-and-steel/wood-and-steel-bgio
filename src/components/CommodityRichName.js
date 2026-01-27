import React from "react";
import { commodityIcons } from "../shared/assets/icons";

// Helper function to capitalize first letter
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Reusable component for displaying commodity with icon and capitalized name
export function CommodityRichName({ commodity, iconClassName }) {
  return (
    <div className="commodityRichName">
      <img src={commodityIcons[commodity]} alt={commodity} className={iconClassName || "commodityRow__icon"} />
      <span>{capitalizeFirst(commodity)}</span>
    </div>
  );
}
