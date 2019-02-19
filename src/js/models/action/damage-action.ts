import { Action } from "./action";
import { Map } from "immutable";
import { Entity } from "../game/entity";
import { AllCardsService } from "../../services/all-cards.service";
import { Damage } from "./damage";
import { HasDamage } from "./has-damage";

export class DamageAction extends Action implements HasDamage {
    readonly damages: ReadonlyArray<Damage>;

    readonly allCards: AllCardsService;

    constructor(allCards: AllCardsService) {
        super();
        this.allCards = allCards;
    }

    public static create(newAction, allCards: AllCardsService): DamageAction {
        return Object.assign(new DamageAction(allCards), newAction);
    }

    public update(entities: Map<number, Entity>): DamageAction {
        return Object.assign(new DamageAction(this.allCards), this, { entities: entities });
    }

    public enrichWithText(): DamageAction {
        const textRaw = '\t' + this.damages
                .map((damage) => {
                    const entityCardId = this.entities.get(damage.entity).cardID;
                    const entityCard = this.allCards.getCard(entityCardId);
                    return `${entityCard.name} takes ${damage.amount} damage`;
                })
                .join(', ');
        return Object.assign(new DamageAction(this.allCards), this, { textRaw: textRaw });                
    }
}