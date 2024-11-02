import React from "react";

// Following imports are for generating test output
import Contract from "./Contract";

export function WoodAndSteelState({ ctx, G, moves }) {

  const pageStyle = {
    padding: '1rem',
  };
  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '14px',
  };
  const textBoxStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  };
  const buttonBarStyle = {
    display: 'flex',
    flexDirection: 'row',
    gap: '0.5rem',
  };
  const buttonStyle = {
    height: '40px',
    textAlign: 'center',
    paddingLeft: '1rem',
    paddingRight: '1rem',
  };
  const contractStyle = {
    padding: '1rem',
    margin: '1rem',
    backgroundColor: '#f0f0f0',
  };

  let contractDescription = G.contracts.length > 0 ? Contract.fromJSON(G.contracts[G.contracts.length - 1]).toString() : "no contracts yet";
  
  function handleSubmit(e) {
    // Prevent the browser from reloading the page
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const activeCities = Object.fromEntries(formData.entries()).activeCities.split(',').map(i => i.trim());

    moves.generateContract(activeCities);
  }

  return (
    <div style={pageStyle}>
      <form style={formStyle} method="post" onSubmit={handleSubmit}>
        <label style={textBoxStyle}>
          <span>Active cities:</span>
          <input name="activeCities" autoFocus={true} defaultValue="Jacksonville,Tallahassee" />
        </label>
        <div style={buttonBarStyle}>
          <button style={buttonStyle}>Generate Starting Contract</button>
        </div>
      </form>
      <div style={contractStyle}>
        <span>{contractDescription}</span>
      </div>
    </div>
  );
}
