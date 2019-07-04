import { Action } from "./action";
import { Map } from "immutable";
import { Entity } from "../game/entity";
import { AllCardsService } from "../../services/all-cards.service";
import { HasTarget } from "./has-target";

export class AttackAction extends Action implements HasTarget {
    readonly originId: number;
    readonly targetId: number;

    constructor(private allCards: AllCardsService) {
        super();
    }

    public static create(newAction, allCards: AllCardsService): AttackAction {
        return Object.assign(new AttackAction(allCards), newAction);
    }

    public update(entities: Map<number, Entity>): AttackAction {
        return Object.assign(new AttackAction(this.allCards), this, { entities: entities });
    }

    public enrichWithText(): AttackAction {
        const originCardId = this.entities.get(this.originId).cardID;
        const targetCardId = this.entities.get(this.targetId).cardID;
        const originCard = this.allCards.getCard(originCardId);
        const targetCard = this.allCards.getCard(targetCardId);
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
        const textRaw = `\t${originCard.name} attacks ${targetCard.name}. ${damageText}`;
        return Object.assign(new AttackAction(this.allCards), this, { textRaw: textRaw });                
    }

    protected getInstance(): Action {
        return new AttackAction(this.allCards);
    }
}