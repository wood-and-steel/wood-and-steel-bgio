import { generateStartingContract } from "./graph";

export const WoodAndSteel = {
  setup: () => ({ 
    contracts: Array(0),
  }),

  moves: {

    // TODO: Remove generateContract. Wired it up this way for now to work around my lack of React skill.

    generateContract: ({ G }, activeCities) => {
      const contract = generateStartingContract(activeCities);
      G.contracts.push(contract.toJSON());
    },
  },
};
