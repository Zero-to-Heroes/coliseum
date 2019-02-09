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
        const ownerNames: string[] = uniq(this.playerMulligan
                .map((entityId) => ActionHelper.getOwner(this.entities, entityId))
                .map((playerEntity) => playerEntity.name));
        if (ownerNames.length !== 1) {
            throw new Error('Invalid grouping of cards ' + ownerNames + ', ' + this.playerMulligan);
        }
        const ownerName = ownerNames[0];
        const playerMulliganCardNames = this.playerMulligan
                .map((cardId) => this.entities.get(cardId))
                .map((entity) => entity.cardID)
                .map((cardId) => this.allCards.getCard(cardId).name)
                .join(', ');
        const textRaw = `\t${ownerName} mulligans ${playerMulliganCardNames}`;
        return Object.assign(new MulliganCardAction(this.allCards), this, { textRaw: textRaw });                
    }
}