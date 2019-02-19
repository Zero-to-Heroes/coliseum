import { Action } from "./action";
import { Map } from "immutable";
import { Entity } from "../game/entity";
import { AllCardsService } from "../../services/all-cards.service";

export class DamageAction extends Action {
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

export class Damage {
    readonly entity: number;
    readonly amount: number;
}