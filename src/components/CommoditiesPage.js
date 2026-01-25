import React from "react";
import { commodities } from "../data";
import { commodityIcons } from "../shared/assets/icons";

// Helper function
function formatCommodityList(items) {
  return items.toString().replaceAll(',', ', ');
}

// Commodities Page Component
export function CommoditiesPage() {
  const commodityList = [...commodities].map(([key, value]) =>
    <div key={key} className="commodityRow">
      <img src={commodityIcons[key]} alt={key} className="commodityRow__icon" />
      <span>{key}</span>
      <span className="commodityRow__cities">• {formatCommodityList(value.cities)}</span>
    </div>
  );

  return (
    <div className="pageContent">
      <div className="referenceTable__title">Commodities</div>
      <div className="referenceTable commodityTable">{commodityList}</div>
    </div>
  );
}
