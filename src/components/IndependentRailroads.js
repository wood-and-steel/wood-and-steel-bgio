import React from "react";

// Independent Railroads Component
export function IndependentRailroads({ G }) {
  // Convert object to array for rendering
  const railroadsArray = Object.values(G.independentRailroads);
  
  return (
    <div>
      <div style={{fontWeight: "bold", paddingBottom: "0.5rem"}}>Independent railroads</div>
      <div className="independentRailroads">
        {railroadsArray.map((railroad) =>
          <div key={railroad.name} style={{marginBottom: "0.1rem"}}>
            <button 
              name="acquireIndependentRailroad" 
              id={railroad.name} 
              className="button" 
              style={{marginRight: "0.5rem"}}
            >Acquire</button>
            <span style={{opacity: "0.6"}}>{railroad.name}</span>
            {railroad.routes.map((route, routeIndex) => (
              <span key={routeIndex} style={{marginLeft: "0.3rem"}}>• {route}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
