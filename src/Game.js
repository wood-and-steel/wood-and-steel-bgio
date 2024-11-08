import Contract from "./Contract"
import { TurnOrder } from 'boardgame.io/core';

export const WoodAndSteel = {
  name: "wood-and-steel",
  
  setup: () => ({ 
    contracts: Array(0),
  }),

  moves: {

    generateStartingContract: ({ G, playerID }, activeCities) => {
      // TODO: Remove generateStartingContract. Wired it up this way for now to work around my lack of React skill.
      const contract = Contract.generateStartingContract(G, activeCities);
      G.contracts.push(contract.toJSON());
    },

    generatePrivateContract: ({ G, playerID }, activeCities, currentCityKey) => {
      // TODO: Remove generatePrivateContract. Wired it up this way for now to work around my lack of React skill.
      const contract = Contract.generatePrivateContract(G, activeCities, currentCityKey);
      G.contracts.push(contract.toJSON());
    },

    generateMarketContract: ({ G, playerID }, activeCities) => {
      // TODO: Remove generateMarketContract. Wired it up this way for now to work around my lack of React skill.
      const contract = Contract.generateMarketContract(G, activeCities);
      G.contracts.push(contract.toJSON());
    },
  },

  turn: {
    // HACK: Storing multiple players in G for contracts, but only rendeirng client
    // for player 0, so we want to make sure it's always player 0's turn for now.
    order: TurnOrder.CUSTOM(['0']),
  }
};
