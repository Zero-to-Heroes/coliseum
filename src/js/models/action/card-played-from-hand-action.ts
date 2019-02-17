import { Action } from "./action";
import { Map } from "immutable";
import { Entity } from "../game/entity";
import { ActionHelper } from "../../services/parser/action/action-helper";
import { AllCardsService } from "../../services/all-cards.service";

export class CardPlayedFromHandAction extends Action {
    readonly entityId: number;

    readonly allCards: AllCardsService;

    constructor(allCards: AllCardsService) {
        super();
        this.allCards = allCards;
    }

    public static create(newAction, allCards: AllCardsService): CardPlayedFromHandAction {
        return Object.assign(new CardPlayedFromHandAction(allCards), newAction);
    }

    public update(entities: Map<number, Entity>): CardPlayedFromHandAction {
        return Object.assign(new CardPlayedFromHandAction(this.allCards), this, { entities: entities });
    }

    public enrichWithText(): CardPlayedFromHandAction {
        const ownerName: string = ActionHelper.getOwner(this.entities, this.entityId).name;
        const cardId: string = this.entities.get(this.entityId).cardID;
        const card = this.allCards.getCard(cardId);
        const textRaw = `\t${ownerName} plays ${card.name}`;
        return Object.assign(new CardPlayedFromHandAction(this.allCards), this, { textRaw: textRaw });                
    }
}