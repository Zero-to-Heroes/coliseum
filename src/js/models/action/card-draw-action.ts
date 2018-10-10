import { Action } from "./action";
import { EntityDefinition } from "../entity-definition";
import { Map } from "immutable";

export class CardDrawAction extends Action {
    readonly data: ReadonlyArray<number>;

    public update(entities: Map<number, EntityDefinition>): CardDrawAction {
        return Object.assign(new CardDrawAction(), this, { entities: entities });
    }

    public static create(newAction): CardDrawAction {
        return Object.assign(new CardDrawAction(), newAction);
    }
}