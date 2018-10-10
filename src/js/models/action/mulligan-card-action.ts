import { Action } from "./action";
import { EntityDefinition } from "../entity-definition";
import { Map } from "immutable";

export class MulliganCardAction extends Action {
    readonly playerMulligan: ReadonlyArray<number>;
    readonly opponentMulligan: ReadonlyArray<number>;

    public update(entities: Map<number, EntityDefinition>): MulliganCardAction {
        return Object.assign(new MulliganCardAction(), this, { entities: entities });
    }
    
    public static create(newAction): MulliganCardAction {
        return Object.assign(new MulliganCardAction(), newAction);
    }
}