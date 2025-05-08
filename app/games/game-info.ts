import { displayGameType, GameTypeEnum } from "@/types/games";

export const gameInfo = [
    { game: displayGameType(GameTypeEnum.MARBLES), path: '/games/marbles', description: 'Remove 1-3 marbles at a time', img: 'marbles', gameType: GameTypeEnum.MARBLES },
    { game: displayGameType(GameTypeEnum.NIM), path: '/games/nim', description: 'Remove stones from any pile', img: 'nim', gameType: GameTypeEnum.NIM },
    { game: displayGameType(GameTypeEnum.LONE_KNIGHT), path: '/games/loneknight', description: 'Knight game with 1 knight', img: 'loneknight', gameType: GameTypeEnum.LONE_KNIGHT },
    { game: displayGameType(GameTypeEnum.MULTI_KNIGHT), path: '/games/multiknight', description: 'Knight game with multiple knights', img: 'multiknight', gameType: GameTypeEnum.MULTI_KNIGHT },
];
