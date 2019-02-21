import { Action } from "./action";
import { Map } from "immutable";
import { Entity } from "../game/entity";
import { ActionHelper } from "../../services/parser/action/action-helper";
import { AllCardsService } from "../../services/all-cards.service";
import { GameTag } from "../enums/game-tags";
import { CardType } from "../enums/card-type";

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
        const cardEntity = this.entities.get(this.entityId);
        const cardId: string = cardEntity.cardID;
        const card = this.allCards.getCard(cardId);
        let playVerb = 'plays';
        if (cardEntity.getTag(GameTag.CARDTYPE) === CardType.WEAPON) {
            playVerb = 'equips'
        }
        const textRaw = `\t${ownerName} ${playVerb} ${card.name}`;
        return Object.assign(new CardPlayedFromHandAction(this.allCards), this, { textRaw: textRaw });                
    }
}