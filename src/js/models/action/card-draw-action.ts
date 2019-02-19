import { Action } from "./action";
import { Map } from "immutable";
import { Entity } from "../game/entity";
import { ActionHelper } from "../../services/parser/action/action-helper";
import { uniq } from 'lodash';
import { AllCardsService } from "../../services/all-cards.service";
import { MetaTags } from "../enums/meta-tags";


export class CardDrawAction extends Action {
    readonly data: ReadonlyArray<number>;
    readonly controller: number;

    readonly allCards: AllCardsService;

    constructor(allCards: AllCardsService) {
        super();
        this.allCards = allCards;
    }

    public static create(newAction, allCards: AllCardsService): CardDrawAction {
        return Object.assign(new CardDrawAction(allCards), newAction);
    }

    public update(entities: Map<number, Entity>): CardDrawAction {
        return Object.assign(new CardDrawAction(this.allCards), this, { entities: entities });
    }

    public enrichWithText(): CardDrawAction {
        const playerEntity = this.data.map((entityId) => ActionHelper.getOwner(this.entities, entityId));
        if (!playerEntity || playerEntity.length === 0) {
            console.error('could not find player owner', this.data);
        }
        const ownerNames: string[] = uniq(this.data
                .map((entityId) => ActionHelper.getOwner(this.entities, entityId))
                .map((playerEntity) => {
                    if (!playerEntity) {
                        console.error('no player entity', playerEntity, this.data, this.entities.get(this.data[0]).tags.toJS());
                    }
                    return playerEntity.name
                }));
        if (ownerNames.length !== 1) {
            throw new Error('Invalid grouping of cards ' + ownerNames + ', ' + this.data);
        }
        const ownerName = ownerNames[0];
        const drawnCards = this.data
                .map((cardId) => this.entities.get(cardId))
                .map((entity) => entity.cardID)
                .map((cardId) => this.allCards.getCard(cardId));
        let drawInfo = '';
        // We don't have the mulligan info, so we just display the amount of cards being mulliganed
        if (drawnCards.some((card) => !card)) {
            drawInfo = `${drawnCards.length} cards`;
        }
        else {
            drawInfo = drawnCards.map((card) => card.name).join(', ');
        }

        const textRaw = `\t${ownerName} draws ` + drawInfo;
        return Object.assign(new CardDrawAction(this.allCards), this, { textRaw: textRaw });                
    }
}