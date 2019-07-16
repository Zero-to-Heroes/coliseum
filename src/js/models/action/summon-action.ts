import { Action } from './action';
import { Map } from 'immutable';
import { Entity } from '../game/entity';
import { AllCardsService } from '../../services/all-cards.service';
import { ActionHelper } from '../../services/parser/action/action-helper';

export class SummonAction extends Action {
	readonly origin: number;
	readonly entityIds: ReadonlyArray<number>;

	readonly allCards: AllCardsService;

	constructor(allCards: AllCardsService) {
		super();
		this.allCards = allCards;
	}

	public static create(newAction, allCards: AllCardsService): SummonAction {
		return Object.assign(new SummonAction(allCards), newAction);
	}

	public update(entities: Map<number, Entity>): SummonAction {
		return Object.assign(new SummonAction(this.allCards), this, { entities: entities });
	}

	public enrichWithText(): SummonAction {
		const originCardId = ActionHelper.getCardId(this.entities, this.origin);
		const originCardName = this.allCards.getCard(originCardId).name;
		const summonCardNames = this.entityIds
				.map((entityId) => ActionHelper.getCardId(this.entities, entityId))
				.map((cardId) => this.allCards.getCard(cardId).name)
				.join(', ');
		const textRaw = `\t${originCardName} summons ${summonCardNames}`;
		return Object.assign(new SummonAction(this.allCards), this, { textRaw: textRaw });
	}

	protected getInstance(): Action {
		return new SummonAction(this.allCards);
	}
}
