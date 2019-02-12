import { Action } from "./action";
import { Map } from "immutable";
import { Entity } from "../game/entity";
import { AllCardsService } from "../../services/all-cards.service";

export class MinionDeathAction extends Action {
    readonly deadMinions: ReadonlyArray<number>;

    readonly allCards: AllCardsService;

    constructor(allCards: AllCardsService) {
        super();
        this.allCards = allCards;
    }

    public static create(newAction, allCards: AllCardsService): MinionDeathAction {
        return Object.assign(new MinionDeathAction(allCards), newAction);
    }

    public update(entities: Map<number, Entity>): MinionDeathAction {
        return Object.assign(new MinionDeathAction(this.allCards), this, { entities: entities });
    }

    public enrichWithText(): MinionDeathAction {
        const deadMinionNames = this.deadMinions
                .map((entityId) => this.entities.get(entityId).cardID)
                .map((cardId) => this.allCards.getCard(cardId))
                .map((card) => card.name)
                .join(', ');
        const textRaw = `\t${deadMinionNames} die`;
        return Object.assign(new MinionDeathAction(this.allCards), this, { textRaw: textRaw });                
    }
}