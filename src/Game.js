import Contract from "./Contract"

export const WoodAndSteel = {
  setup: () => ({ 
    contracts: Array(0),
  }),

  moves: {

    generateStartingContract: ({ G }, activeCities) => {
      // TODO: Remove generateStaartingContract. Wired it up this way for now to work around my lack of React skill.
      const contract = Contract.generateStartingContract(G, activeCities);
      G.contracts.push(contract.toJSON());
    },

    generateMarketContract: ({ G }, activeCities) => {
      // TODO: Remove generateMarketContract. Wired it up this way for now to work around my lack of React skill.
      const contract = Contract.generateMarketContract(G, activeCities);
      G.contracts.push(contract.toJSON());
    },
  },
};
