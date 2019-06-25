import { Action } from "./action";
import { Map } from "immutable";
import { Entity } from "../game/entity";
import { AllCardsService } from "../../services/all-cards.service";
import { PlayerEntity } from "../game/player-entity";

export class DiscoverAction extends Action {

    readonly origin: number;
    readonly ownerId: number;
    readonly choices: ReadonlyArray<number>;

    readonly allCards: AllCardsService;

    constructor(allCards: AllCardsService) {
        super();
        this.allCards = allCards;
    }

    public static create(newAction, allCards: AllCardsService): DiscoverAction {
        return Object.assign(new DiscoverAction(allCards), newAction);
    }

    public update(entities: Map<number, Entity>): DiscoverAction {
        return Object.assign(new DiscoverAction(this.allCards), this, { entities: entities });
    }

    public enrichWithText(): DiscoverAction {
        const owner = this.entities.get(this.ownerId) as PlayerEntity;
        const offeredCards = this.choices
                .map((cardId) => this.entities.get(cardId))
                .map((entity) => entity.cardID)
                .map((cardId) => this.allCards.getCard(cardId));
        let offerInfo = '';
        // We don't have the mulligan info, so we just display the amount of cards being mulliganed
        if (offeredCards.some((card) => !card)) {
            offerInfo = `${offeredCards.length} cards`;
        }
        else {
            offerInfo = offeredCards.map((card) => card.name).join(', ');
        }
        const textRaw = `\t${owner.name} discovers ${offerInfo}`;
        return Object.assign(new DiscoverAction(this.allCards), this, { textRaw: textRaw });                
    }

    protected getInstance(): Action {
        return new DiscoverAction(this.allCards);
    }
}