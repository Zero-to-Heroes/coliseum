import { Map } from "immutable";
import { Entity } from "../game/entity";
import { Damage } from "./damage";
import { PlayState } from "../enums/playstate";

export abstract class Action {
    readonly timestamp: number;
    readonly index: number;
    readonly textRaw: string;
    
    // Game state information
    readonly entities: Map<number, Entity>;
    readonly crossedEntities: ReadonlyArray<number> = [];
    readonly highlightedEntities: ReadonlyArray<number>;
    readonly activeSpell: number;
    readonly isMulligan: boolean;
    readonly isEndGame: boolean;
    readonly endGameStatus: PlayState;
    readonly targets: ReadonlyArray<[number, number]>;
    readonly options: ReadonlyArray<number> = [];
    // This is part of the global action, because damage actions can be merged 
    // into non-damage ones
    readonly damages: ReadonlyArray<Damage>; 

    protected abstract getInstance(): Action;
    abstract update(entities: Map<number, Entity>): Action;
    abstract enrichWithText(): Action;

    public updateAction<T extends Action>(newAction: T): T {
        return Object.assign(this.getInstance(), this, newAction);
    }
}