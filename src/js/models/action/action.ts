import { Map } from "immutable";
import { Entity } from "../game/entity";

export abstract class Action {
    readonly timestamp: number;
    readonly index: number;
    readonly text: string;
    readonly entities: Map<number, Entity>;

    abstract update(entities: Map<number, Entity>): Action;
}