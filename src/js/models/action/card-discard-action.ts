import { Action } from "./action";
import { Map } from "immutable";
import { Entity } from "../game/entity";
import { ActionHelper } from "../../services/parser/action/action-helper";
import { uniq } from 'lodash';
import { AllCardsService } from "../../services/all-cards.service";

export class CardDiscardAction extends Action {

    readonly data: ReadonlyArray<number>;
    readonly controller: number;

    constructor(private allCards: AllCardsService) {
        super();
    }

    public static create(newAction, allCards: AllCardsService): CardDiscardAction {
        return Object.assign(new CardDiscardAction(allCards), newAction);
    }

    public update(entities: Map<number, Entity>): CardDiscardAction {
        return Object.assign(this.getInstance(), this, { entities: entities });
    }

    public enrichWithText(): CardDiscardAction {
        const playerEntity = this.data.map((entityId) => ActionHelper.getOwner(this.entities, entityId));
        if (!playerEntity || playerEntity.length === 0) {
            console.error('[discard-action] could not find player owner', this.data);
        }
        const ownerNames: string[] = uniq(this.data
                .map((entityId) => ActionHelper.getOwner(this.entities, entityId))
                .map((playerEntity) => {
                    if (!playerEntity) {
                        console.error('[discard-action] no player entity', playerEntity, this.data, this.entities.get(this.data[0]).tags.toJS());
                    }
                    return playerEntity.name
                }));
        if (ownerNames.length !== 1) {
            throw new Error('[discard-action] Invalid grouping of cards ' + ownerNames + ', ' + this.data);
        }
        const ownerName = ownerNames[0];
        const discardedCards = this.data
                .map((entityId) => ActionHelper.getCardId(this.entities, entityId))
                .map((cardId) => this.allCards.getCard(cardId));
        let discardInfo = '';
        if (discardedCards.some((card) => !card || !card.name)) {
            discardInfo = `${discardedCards.length} cards`;
        }
        else {
            discardInfo = discardedCards.map((card) => card.name).join(', ');
        }

        const textRaw = `\t${ownerName} discards ` + discardInfo;
        return Object.assign(this.getInstance(), this, { textRaw: textRaw });                
    }

    protected getInstance(): Action {
        return new CardDiscardAction(this.allCards);
    }
}