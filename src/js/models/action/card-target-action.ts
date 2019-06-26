import { Action } from "./action";
import { Map } from "immutable";
import { Entity } from "../game/entity";
import { AllCardsService } from "../../services/all-cards.service";
import { HasTargets } from "./has-targets";

export class CardTargetAction extends Action implements HasTargets {    
    readonly originId: number;
    readonly targetIds: ReadonlyArray<number>;

    readonly allCards: AllCardsService;

    constructor(allCards: AllCardsService) {
        super();
        this.allCards = allCards;
    }

    public static create(newAction, allCards: AllCardsService): CardTargetAction {
        return Object.assign(new CardTargetAction(allCards), newAction);
    }

    public update(entities: Map<number, Entity>): CardTargetAction {
        return Object.assign(new CardTargetAction(this.allCards), this, { entities: entities });
    }

    public enrichWithText(): CardTargetAction {
        const originCardId = this.entities.get(this.originId).cardID;
        const targetCardIds = this.targetIds
                .map((entityId) => this.entities.get(entityId))
                .map((entity) => entity.cardID);
        const originCardName = this.allCards.getCard(originCardId).name;
        const targetCardNames = targetCardIds
                .map((cardId) => this.allCards.getCard(cardId))
                .map((card) => card.name)
                .join(', ');
        const textRaw = `\t${originCardName} targets ${targetCardNames}`;
        return Object.assign(new CardTargetAction(this.allCards), this, { textRaw: textRaw });                
    }

    protected getInstance(): Action {
        return new CardTargetAction(this.allCards);
    }
}