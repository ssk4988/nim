import { GameInterface, GameTypeEnum, TimeControlEnum, GameEnumToGameState, GameTypeToState } from "@/types/games";
import { Game, PublicGame } from "@/types/websocket";

// turn the game into a public game
export function makePublicGame<G, M>(game: Game<GameInterface<G, M>>): PublicGame<GameInterface<G, M>> {
  const returnobject: PublicGame<GameInterface<G, M>> = {
    players: [
      { name: game.players[0].name, username: game.players[0].username },
      { name: game.players[1].name, username: game.players[1].username },
    ],
    gameState: game.gameState,
    firstPlayer: game.firstPlayer,
    winner: game.winner,
    code: game.code,
    gameConfig: game.gameConfig,
    playerTimes: game.playerTimes,
    lastUpdated: game.lastUpdated,
  };
  return returnobject;
}

// Switch players if needed
export function flipGamePerspective<G extends GameInterface<G, M>, M>(game: PublicGame<GameInterface<G, M>>, flip: boolean) {
  if(!flip) return game;
  let adjustedGame: PublicGame<GameInterface<G, M>> = { ...game, gameState: game.gameState.clone() };
  adjustedGame.players = [game.players[1], game.players[0]];
  adjustedGame.gameState.turn = !game.gameState.turn;
  adjustedGame.firstPlayer = game.firstPlayer === 0 ? 1 : 0;
  if (game.winner !== null) {
    adjustedGame.winner = game.winner === 0 ? 1 : 0;
  }
  adjustedGame.playerTimes = [game.playerTimes[1], game.playerTimes[0]];
  return adjustedGame;
}

export function gameStateFactory(type: GameTypeEnum): GameInterface<any, any> {
  return GameEnumToGameState[type].gen();
}

// Synchronize the game time with the server in place
export function synchronizeGameTime<G, M>(game: Game<GameInterface<G, M>>) {
  if (game.winner !== null) {
    return;
  }
  let currentTime = Date.now();
  let timeDiff = currentTime - game.lastUpdated;
  game.playerTimes[game.playerTurn] = Math.max(0, game.playerTimes[game.playerTurn] - timeDiff);
  game.lastUpdated = currentTime;
}

// check if a game is over, assuming the game is not already over and is synchronized
export function shouldGameEnd<G, M>(game: Game<GameInterface<G, M>>): boolean {
  if (game.gameState.isGameOver()) {
    return true;
  }
  // Check if the player has run out of time
  if (Math.min(game.playerTimes[0], game.playerTimes[1]) <= 0) {
    return true;
  }
  return false;
}

// These are the game types and time controls enabled for live games
export const liveGameTypes: GameTypeEnum[] = [GameTypeEnum.NIM, GameTypeEnum.MARBLES, GameTypeEnum.MULTI_KNIGHT];
export const liveTimeControlTypes: TimeControlEnum[] = [
  TimeControlEnum.SEC15,
  TimeControlEnum.MIN1,
  TimeControlEnum.MIN5,
];
