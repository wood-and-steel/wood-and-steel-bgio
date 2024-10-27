import { Client } from 'boardgame.io/react';
import { WoodAndSteel } from './Game';
import { WoodAndSteelState } from './Board';

const App = Client({ 
  game: WoodAndSteel,
  board: WoodAndSteelState,
});

export default App;
