import { Action } from "./action";
import { Map } from "immutable";
import { Entity } from "../game/entity";
import { AllCardsService } from "../../services/all-cards.service";

export class SecretRevealedAction extends Action {
    readonly entityId: number;

    readonly allCards: AllCardsService;

    constructor(allCards: AllCardsService) {
        super();
        this.allCards = allCards;
    }

    public static create(newAction, allCards: AllCardsService): SecretRevealedAction {
        return Object.assign(new SecretRevealedAction(allCards), newAction);
    }

    public update(entities: Map<number, Entity>): SecretRevealedAction {
        return Object.assign(new SecretRevealedAction(this.allCards), this, { entities: entities });
    }

    public enrichWithText(): SecretRevealedAction {
        const cardId = this.entities.get(this.entityId).cardID;
        const cardName = this.allCards.getCard(cardId).name;
        const textRaw = `\t... which triggers ${cardName}!`;
        return Object.assign(new SecretRevealedAction(this.allCards), this, { textRaw: textRaw });                
    }

    protected getInstance(): Action {
        return new SecretRevealedAction(this.allCards);
    }
}