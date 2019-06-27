import { Map } from "immutable";
import { Entity } from "../game/entity";
import { Damage } from "./damage";

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
    readonly targets: ReadonlyArray<[number, number]>;
    // This is part of the global action, because damage actions can be merged 
    // into non-damage ones
    readonly damages: ReadonlyArray<Damage>; 

    protected abstract getInstance(): Action;
    abstract update(entities: Map<number, Entity>): Action;
    abstract enrichWithText(): Action;

    public updateAction(newAction: Action): Action {
        return Object.assign(this.getInstance(), this, newAction);
    }
}