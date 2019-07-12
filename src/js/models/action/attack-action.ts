import { Action } from "./action";
import { Map } from "immutable";
import { Entity } from "../game/entity";
import { AllCardsService } from "../../services/all-cards.service";
import { HasTarget } from "./has-target";
import { ActionHelper } from "../../services/parser/action/action-helper";

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
        const originCardId = ActionHelper.getCardId(this.entities, this.originId);
        const targetCardId = ActionHelper.getCardId(this.entities, this.targetId);
        const originCard = this.allCards.getCard(originCardId);
        const targetCard = this.allCards.getCard(targetCardId);
        let damageText = '';
        if (this.damages) {
            damageText = this.damages
                    .map((amount, entityId) => {
                        const entityCardId = ActionHelper.getCardId(this.entities, entityId);
                        const entityCard = this.allCards.getCard(entityCardId);
                        return `${entityCard.name} takes ${amount} damage`;
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