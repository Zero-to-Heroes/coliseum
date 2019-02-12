import { Action } from "./action";
import { Map } from "immutable";
import { Entity } from "../game/entity";
import { AllCardsService } from "../../services/all-cards.service";

export class PowerTargetAction extends Action {
    
    readonly origin: number;
    readonly targets: ReadonlyArray<number>;

    readonly allCards: AllCardsService;

    constructor(allCards: AllCardsService) {
        super();
        this.allCards = allCards;
    }

    public static create(newAction, allCards: AllCardsService): PowerTargetAction {
        return Object.assign(new PowerTargetAction(allCards), newAction);
    }

    public update(entities: Map<number, Entity>): PowerTargetAction {
        return Object.assign(new PowerTargetAction(this.allCards), this, { entities: entities });
    }

    public enrichWithText(): PowerTargetAction {
        const originCardId = this.entities.get(this.origin).cardID;
        const targetCardIds = this.targets
                .map((entityId) => this.entities.get(entityId))
                .map((entity) => entity.cardID);
        const originCardName = this.allCards.getCard(originCardId).name;
        const targetCardNames = targetCardIds
                .map((cardId) => this.allCards.getCard(cardId))
                .map((card) => card.name)
                .join(', ');
        const textRaw = `\t${originCardName} targets ${targetCardNames}`;
        return Object.assign(new PowerTargetAction(this.allCards), this, { textRaw: textRaw });                
    }
}