import { Action } from "./action";
import { Map } from "immutable";
import { Entity } from "../game/entity";
import { ActionHelper } from "../../services/parser/action/action-helper";
import { AllCardsService } from "../../services/all-cards.service";

export class SecretPlayedFromHandAction extends Action {
    readonly entityId: number;

    readonly allCards: AllCardsService;

    constructor(allCards: AllCardsService) {
        super();
        this.allCards = allCards;
    }

    public static create(newAction, allCards: AllCardsService): SecretPlayedFromHandAction {
        return Object.assign(new SecretPlayedFromHandAction(allCards), newAction);
    }

    public update(entities: Map<number, Entity>): SecretPlayedFromHandAction {
        return Object.assign(new SecretPlayedFromHandAction(this.allCards), this, { entities: entities });
    }

    public enrichWithText(): SecretPlayedFromHandAction {
        const ownerName: string = ActionHelper.getOwner(this.entities, this.entityId).name;
        const cardId: string = this.entities.get(this.entityId).cardID;
        const card = this.allCards.getCard(cardId);
        const textRaw = `\t${ownerName} plays a secret! ${card.name}`;
        return Object.assign(new SecretPlayedFromHandAction(this.allCards), this, { textRaw: textRaw });                
    }

    protected getInstance(): Action {
        return new SecretPlayedFromHandAction(this.allCards);
    }
}