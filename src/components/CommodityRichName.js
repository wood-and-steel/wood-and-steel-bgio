import React from "react";
import { commodityIcons } from "../shared/assets/icons";

// Helper function to capitalize first letter
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Displays a commodity name with its associated icon. The name is automatically capitalized.
 * 
 * @component
 * @param {object} props
 * @param {string} props.commodity - The commodity name (lowercase, e.g., "wood", "steel").
 * @param {string} [props.iconClassName] - Optional CSS class name for the icon. Defaults to "commodityRow__icon".
 * 
 * @example
 * <CommodityRichName commodity="wood" />
 * <CommodityRichName commodity="steel" iconClassName="custom-icon-class" />
 */
export function CommodityRichName({ commodity, iconClassName }) {
  return (
    <div className="commodityRichName">
      <img src={commodityIcons[commodity]} alt={commodity} className={iconClassName || "commodityRow__icon"} />
      <span>{capitalizeFirst(commodity)}</span>
    </div>
  );
}
