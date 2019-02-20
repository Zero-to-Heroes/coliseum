import { Action } from "./action";
import { Map } from "immutable";
import { Entity } from "../game/entity";
import { AllCardsService } from "../../services/all-cards.service";
import { HasDamage } from "./has-damage";
import { Damage } from "./damage";

export class HealingAction extends Action implements HasDamage {
    readonly damages: ReadonlyArray<Damage>;

    readonly allCards: AllCardsService;

    constructor(allCards: AllCardsService) {
        super();
        this.allCards = allCards;
    }

    public static create(newAction, allCards: AllCardsService): HealingAction {
        return Object.assign(new HealingAction(allCards), newAction);
    }

    public update(entities: Map<number, Entity>): HealingAction {
        return Object.assign(new HealingAction(this.allCards), this, { entities: entities });
    }

    public enrichWithText(): HealingAction {
        const textRaw = '\t' + this.damages
                .map((damage) => {
                    const entityCardId = this.entities.get(damage.entity).cardID;
                    const entityCard = this.allCards.getCard(entityCardId);
                    return `${entityCard.name} heals for ${-damage.amount}`;
                })
                .join(', ');
        return Object.assign(new HealingAction(this.allCards), this, { textRaw: textRaw });                
    }
}