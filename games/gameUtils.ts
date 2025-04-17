import { GameInterface, GameTypeEnum } from "@/types/games";
import { NimState } from "./nim";
import { MarblesState } from "./marbles";
import { LoneKnightState } from "./loneknight";
import { MultiKnightState } from "./multiknight";

export function gameGen(type: GameTypeEnum): GameInterface<any, any> {
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
