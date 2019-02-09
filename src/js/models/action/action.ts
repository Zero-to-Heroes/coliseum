import { Map } from "immutable";
import { Entity } from "../game/entity";

export abstract class Action {
    readonly timestamp: number;
    readonly index: number;
    readonly textRaw: string;
    readonly entities: Map<number, Entity>;

    abstract update(entities: Map<number, Entity>): Action;
    abstract enrichWithText(): Action;
}