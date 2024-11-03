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
    padding: '0.25rem',
    margin: '0rem',
    backgroundColor: '#f0f0f0',
  };

  const contractsList = G.contracts.map((contract, index) => 
    <div key={index} style={contractStyle}>
      {Contract.fromJSON(contract).toString()}
    </div>
  );

  function handleSubmit(e) {
    // Prevent the browser from reloading the page
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const activeCities = Object.fromEntries(formData.entries()).activeCities.split(',').map(i => i.trim());

    switch (e.nativeEvent.submitter.name) {
      case "startingContract":
        moves.generateStartingContract(activeCities);
        break;
      default:
        moves.generateMarketContract(activeCities);
    }
  }

  return (
    <div style={pageStyle}>
      <form style={formStyle} method="post" onSubmit={handleSubmit}>
        <label style={textBoxStyle}>
          <span>Active cities:</span>
          <input name="activeCities" autoFocus={true} defaultValue="Jacksonville,Tallahassee" />
        </label>
        <div style={buttonBarStyle}>
          <button name="startingContract" style={buttonStyle}>Generate Starting Contract</button>
          <button name="marketContract" style={buttonStyle}>Generate Market Contract</button>
        </div>
        {contractsList}
        </form>
    </div>
  );
}
