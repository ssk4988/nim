import { LoneKnightState } from "@/games/loneknight";
import { MarblesState } from "@/games/marbles";
import { MultiKnightState } from "@/games/multiknight";
import { NimState } from "@/games/nim";
import { GameInterface, GameTypeEnum, TimeControlEnum } from "@/types/games";
import { Game, PublicGame } from "@/types/websocket";

// turn the game into a public game
export function makePublicGame<GameState extends GameInterface<any, any>>(game: Game<GameState>): PublicGame<GameState> {
  let returnobject: PublicGame<GameState> = {
    players: [
      { name: game.players[0].name },
      { name: game.players[1].name },
    ],
    gameState: game.gameState,
    firstPlayer: game.firstPlayer,
    winner: game.winner,
    code: game.code,
    gameConfig: game.gameConfig,
    playerTimes: game.playerTimes,
    lastUpdated: game.lastUpdated,
  };
  returnobject.gameState.turn = game.playerTurn === game.firstPlayer;
  return returnobject;
}

// Switch players if needed
export function flipGamePerspective<GameState extends GameInterface<any, any>>(game: PublicGame<GameState>, flip: boolean) {
  let adjustedGame: PublicGame<GameState> = { ...game, gameState: game.gameState.clone() };
  if (flip) {
    adjustedGame.players = [game.players[1], game.players[0]];
    adjustedGame.gameState.turn = !game.gameState.turn;
    adjustedGame.firstPlayer = game.firstPlayer === 0 ? 1 : 0;
    if (game.winner !== null) {
      adjustedGame.winner = game.winner === 0 ? 1 : 0;
    }
    adjustedGame.playerTimes = [game.playerTimes[1], game.playerTimes[0]];
  }
  return adjustedGame;
}

export function gameStateFactory(type: GameTypeEnum): GameInterface<any, any> {
  switch (type) {
    case GameTypeEnum.NIM:
      return NimState.gen();
    case GameTypeEnum.MARBLES:
      return MarblesState.gen();
    case GameTypeEnum.LONE_KNIGHT:
      return LoneKnightState.gen();
    case GameTypeEnum.MULTI_KNIGHT:
      return MultiKnightState.gen();
    default:
      throw new Error("Invalid game type");
  }
}

// Synchronize the game time with the server in place
export function synchronizeGameTime(game: Game<GameInterface<any, any>>) {
  if (game.winner !== null) {
    return;
  }
  let currentTime = Date.now();
  let timeDiff = currentTime - game.lastUpdated;
  game.playerTimes[game.playerTurn] = Math.max(0, game.playerTimes[game.playerTurn] - timeDiff);
  game.lastUpdated = currentTime;
}

// check if a game is over, assuming the game is not already over and is synchronized
export function shouldGameEnd(game: Game<GameInterface<any, any>>): boolean {
  if (game.gameState.isGameOver()) {
    return true;
  }
  // Check if the player has run out of time
  if (Math.min(game.playerTimes[0], game.playerTimes[1]) <= 0) {
    return true;
  }
  return false;
}
  
export const gamesToSetup = [GameTypeEnum.NIM];
export const timeControlsToSetup = [
  TimeControlEnum.SEC15,
  TimeControlEnum.MIN1,
  TimeControlEnum.MIN5,
];
