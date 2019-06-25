import { Action } from "./action";
import { Map } from "immutable";
import { Entity } from "../game/entity";
import { AllCardsService } from "../../services/all-cards.service";

export class MulliganCardChoiceAction extends Action {
    readonly playerMulligan: ReadonlyArray<number>;
    readonly opponentMulligan: ReadonlyArray<number>;

    readonly allCards: AllCardsService;

    constructor(allCards: AllCardsService) {
        super();
        this.allCards = allCards;
    }
    
    public static create(newAction, allCards: AllCardsService): MulliganCardChoiceAction {
        return Object.assign(new MulliganCardChoiceAction(allCards), newAction);
    }

    public update(entities: Map<number, Entity>): MulliganCardChoiceAction {
        return Object.assign(new MulliganCardChoiceAction(this.allCards), this, { entities: entities });
    }

    public enrichWithText(): MulliganCardChoiceAction {
        let textRaw = '';
        return Object.assign(new MulliganCardChoiceAction(this.allCards), this, { textRaw: textRaw });                
    }

    protected getInstance(): Action {
        return new MulliganCardChoiceAction(this.allCards);
    }
}