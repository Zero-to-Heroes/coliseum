import { Action } from "./action";
import { Map } from "immutable";
import { Entity } from "../game/entity";
import { ActionHelper } from "../../services/parser/action/action-helper";
import { uniq } from 'lodash';
import { AllCardsService } from "../../services/all-cards.service";

export class MulliganCardAction extends Action {
    readonly playerMulligan: ReadonlyArray<number>;
    readonly opponentMulligan: ReadonlyArray<number>;

    readonly allCards: AllCardsService;

    constructor(allCards: AllCardsService) {
        super();
        this.allCards = allCards;
    }
    
    public static create(newAction, allCards: AllCardsService): MulliganCardAction {
        return Object.assign(new MulliganCardAction(allCards), newAction);
    }

    public update(entities: Map<number, Entity>): MulliganCardAction {
        return Object.assign(new MulliganCardAction(this.allCards), this, { entities: entities });
    }

    public enrichWithText(): MulliganCardAction {
        let textRaw = this.buildMulliganText(this.playerMulligan) + '\n' + this.buildMulliganText(this.opponentMulligan);
        return Object.assign(new MulliganCardAction(this.allCards), this, { textRaw: textRaw });                
    }

    private buildMulliganText(cards: ReadonlyArray<number>): string {
        if (!cards) {
            return '';
        }
        const ownerNames: string[] = uniq(cards
                .map((entityId) => ActionHelper.getOwner(this.entities, entityId))
                .map((playerEntity) => playerEntity.name));
        if (ownerNames.length !== 1) {
            throw new Error('Invalid grouping of cards ' + ownerNames + ', ' + cards);
        }
        const ownerName = ownerNames[0];
        const mulliganedCards = cards
                .map((entityId) => ActionHelper.getCardId(this.entities, entityId))
                .map((cardId) => this.allCards.getCard(cardId));
        let mulliganInfo = '';
        // We don't have the mulligan info, so we just display the amount of cards being mulliganed
        if (mulliganedCards.some((card) => !card)) {
            mulliganInfo = `${mulliganedCards.length} cards`;
        }
        else {
            mulliganInfo = mulliganedCards.map((card) => card.name).join(', ');
        }
        const textRaw = `\t${ownerName} mulligans ${mulliganInfo}`;
        return textRaw;
    }

    protected getInstance(): Action {
        return new MulliganCardAction(this.allCards);
    }
}