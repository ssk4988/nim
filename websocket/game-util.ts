import { LoneKnightState } from "@/games/loneknight";
import { MarblesState } from "@/games/marbles";
import { MultiKnightState } from "@/games/multiknight";
import { NimState } from "@/games/nim";
import { GameInterface, GameTypeEnum } from "@/types/games";
import { Game, PublicGame } from "@/types/websocket";

// turn the game into a public game
export function makePublicGame<GameState extends GameInterface<any, any>>(game: Game<GameState>): PublicGame<GameState> {
  return {
    players: game.players.map((player) => ({ name: player.name })),
    gameState: game.gameState,
    firstPlayer: game.firstPlayer,
    winner: game.winner,
    code: game.code,
    gameConfig: game.gameConfig,
  };
}

// Switch players if needed
export function flipGamePerspective<GameState extends GameInterface<any, any>>(game: PublicGame<GameState>, flip: boolean) {
  let adjustedGame: PublicGame<GameState> = {...game, gameState: game.gameState.clone()};
  if (flip) {
    adjustedGame.players = [game.players[1], game.players[0]];
    adjustedGame.gameState.turn = !game.gameState.turn;
    adjustedGame.firstPlayer = game.firstPlayer === 0 ? 1 : 0;
    if (game.winner !== null) {
      adjustedGame.winner = game.winner === 0 ? 1 : game.winner === 1 ? 0 : null;
    }
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
