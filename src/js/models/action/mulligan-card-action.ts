import { Action } from "./action";

export class MulliganCardAction extends Action {
    readonly playerMulligan: ReadonlyArray<number>;
    readonly opponentMulligan: ReadonlyArray<number>;
    
    public static create(newAction: MulliganCardAction): MulliganCardAction {
        return Object.assign(new MulliganCardAction(), newAction);
    }
}