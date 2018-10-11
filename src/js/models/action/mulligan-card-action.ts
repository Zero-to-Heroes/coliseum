import { Action } from "./action";
import { Map } from "immutable";
import { Entity } from "../game/entity";

export class MulliganCardAction extends Action {
    readonly playerMulligan: ReadonlyArray<number>;
    readonly opponentMulligan: ReadonlyArray<number>;

    public update(entities: Map<number, Entity>): MulliganCardAction {
        return Object.assign(new MulliganCardAction(), this, { entities: entities });
    }
    
    public static create(newAction): MulliganCardAction {
        return Object.assign(new MulliganCardAction(), newAction);
    }
}