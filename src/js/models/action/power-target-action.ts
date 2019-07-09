import { Action } from "./action";
import { Map } from "immutable";
import { Entity } from "../game/entity";
import { AllCardsService } from "../../services/all-cards.service";
import { HasTargets } from "./has-targets";

export class PowerTargetAction extends Action implements HasTargets {   
    readonly originId: number;
    readonly targetIds: ReadonlyArray<number>; 
    
    constructor(private allCards: AllCardsService) {
        super();
    }

    public static create(newAction, allCards: AllCardsService): PowerTargetAction {
        return Object.assign(new PowerTargetAction(allCards), newAction);
    }

    public update(entities: Map<number, Entity>): PowerTargetAction {
        return Object.assign(new PowerTargetAction(this.allCards), this, { entities: entities });
    }

    public enrichWithText(): PowerTargetAction {
        const originCardId = this.entities.get(this.originId).cardID;
        const targetCardIds = this.targetIds
                .map((entityId) => this.entities.get(entityId))
                .map((entity) => entity.cardID);
        const originCardName = this.allCards.getCard(originCardId).name;
        const cardIds = targetCardIds.map((cardId) => this.allCards.getCard(cardId));
        const targetCardNames = cardIds.some(card => !card) 
                ? `${cardIds.length} cards`
                : cardIds.map((card) => card.name).join(', ');
        let damageText = '';
        if (this.damages) {
            damageText = this.damages
                    .map((damage) => {
                        const entityCardId = this.entities.get(damage.entity).cardID;
                        const entityCard = this.allCards.getCard(entityCardId);
                        return `${entityCard.name} takes ${damage.amount} damage`;
                    })
                    .join(', ');
        }
        const textRaw = `\t${originCardName} targets ${targetCardNames}. ${damageText}`;
        return Object.assign(new PowerTargetAction(this.allCards), this, { textRaw: textRaw });                
    }

    protected getInstance(): Action {
        return new PowerTargetAction(this.allCards);
    }
}