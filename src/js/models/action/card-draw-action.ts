import { Action } from "./action";
import { Map } from "immutable";
import { Entity } from "../game/entity";

export class CardDrawAction extends Action {
    readonly data: ReadonlyArray<number>;

    public update(entities: Map<number, Entity>): CardDrawAction {
        return Object.assign(new CardDrawAction(), this, { entities: entities });
    }

    public static create(newAction): CardDrawAction {
        return Object.assign(new CardDrawAction(), newAction);
    }
}