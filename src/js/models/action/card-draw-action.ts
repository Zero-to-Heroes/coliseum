import { Action } from "./action";

export class CardDrawAction extends Action {
    readonly data: ReadonlyArray<number>;

    public static create(newAction: CardDrawAction): CardDrawAction {
        return Object.assign(new CardDrawAction(), newAction);
    }
}