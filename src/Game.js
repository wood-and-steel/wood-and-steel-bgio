import Contract from "./Contract"

export const WoodAndSteel = {
  setup: () => ({ 
    contracts: Array(0),
  }),

  moves: {
    generateContract: ({ G }, activeCities) => {
    // TODO: Remove generateContract. Wired it up this way for now to work around my lack of React skill.
    const contract = Contract.generateStartingContract(activeCities);
      G.contracts.push(contract.toJSON());
    },
  },
};
