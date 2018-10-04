import { Entity } from "./entity";
import { PlayerEntity } from "./player-entity";

export class Game {

    readonly entities: Map<number, Entity>;
    readonly players: ReadonlyArray<PlayerEntity> = [];

    private constructor() { }

    public static createGame(baseGame: Game, newAttributes?: any): Game {
        return Object.assign(new Game(), {...baseGame, ...newAttributes} as Game);
    }
}