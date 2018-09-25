import { TurnStructure } from "./turn-structure";
import { HistoryItem } from "./history-item";

export class Game {
    readonly startTimestamp: number;
    readonly history: ReadonlyArray<HistoryItem>;
    // readonly player: PlayerEntity;
    // readonly opponent: PlayerEntity;
    // readonly entities: ReadonlyArray<Entity>;
    // readonly turns: TurnStructure;
    // readonly currentTurn: number;
    // readonly currentActionInTurn: number;
    // readonly mainPlayerId: string;
    // readonly activeSpell: Entity;
    // readonly historyPosition: number;
    // readonly currentReplayTime: number;

    private constructor() { }

    public static createGame(baseGame: Game, newAttributes?: any): Game {
        const newGame: Game = {...baseGame, ...newAttributes} as Game;
        // console.log('new game', newGame);
        return newGame;
    }
}