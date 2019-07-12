import { Action } from "./action";
import { Map } from "immutable";
import { Entity } from "../game/entity";
import { AllCardsService } from "../../services/all-cards.service";

export class DamageAction extends Action {
    constructor(private allCards: AllCardsService) {
        super();
    }

    public static create(newAction, allCards: AllCardsService): DamageAction {
        return Object.assign(new DamageAction(allCards), newAction);
    }

    public update(entities: Map<number, Entity>): DamageAction {
        return Object.assign(new DamageAction(this.allCards), this, { entities: entities });
    }

    public enrichWithText(): DamageAction {
        const textRaw = '\t' + this.damages
                .map((amount, entityId) => {
                    const entityCardId = this.entities.get(entityId).cardID;
                    const entityCard = this.allCards.getCard(entityCardId);
                    return `${entityCard.name} takes ${amount} damage`;
                })
                .join(', ');
        return Object.assign(new DamageAction(this.allCards), this, { textRaw: textRaw });                
    }

    protected getInstance(): Action {
        return new DamageAction(this.allCards);
    }
}