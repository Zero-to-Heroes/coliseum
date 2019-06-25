import { Action } from "./action";
import { Map } from "immutable";
import { Entity } from "../game/entity";
import { AllCardsService } from "../../services/all-cards.service";
import { Damage } from "./damage";
import { HasDamage } from "./has-damage";

export class AttackAction extends Action implements HasDamage {
    readonly origin: number;
    readonly target: number;
    readonly damages: ReadonlyArray<Damage> = [];

    readonly allCards: AllCardsService;

    constructor(allCards: AllCardsService) {
        super();
        this.allCards = allCards;
    }

    public static create(newAction, allCards: AllCardsService): AttackAction {
        return Object.assign(new AttackAction(allCards), newAction);
    }

    public update(entities: Map<number, Entity>): AttackAction {
        return Object.assign(new AttackAction(this.allCards), this, { entities: entities });
    }

    public enrichWithText(): AttackAction {
        const originCardId = this.entities.get(this.origin).cardID;
        const targetCardId = this.entities.get(this.target).cardID;
        const originCard = this.allCards.getCard(originCardId);
        const targetCard = this.allCards.getCard(targetCardId);
        const damageText = this.damages
                .map((damage) => {
                    const entityCardId = this.entities.get(damage.entity).cardID;
                    const entityCard = this.allCards.getCard(entityCardId);
                    return `${entityCard.name} takes ${damage.amount} damage`;
                })
                .join(', ');
        const textRaw = `\t${originCard.name} attacks ${targetCard.name}. ${damageText}`;
        return Object.assign(new AttackAction(this.allCards), this, { textRaw: textRaw });                
    }

    protected getInstance(): Action {
        return new AttackAction(this.allCards);
    }
}