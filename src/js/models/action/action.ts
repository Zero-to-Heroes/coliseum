import { EntityDefinition } from "../entity-definition";
import { Map } from "immutable";

export abstract class Action {
    readonly timestamp: number;
    readonly index: number;
    readonly entities: Map<number, EntityDefinition>;

    abstract update(entities: Map<number, EntityDefinition>): Action;
}