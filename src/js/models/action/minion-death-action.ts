import { Action } from './action';
import { Map } from 'immutable';
import { Entity } from '../game/entity';
import { AllCardsService } from '../../services/all-cards.service';
import { ActionHelper } from '../../services/parser/action/action-helper';

export class MinionDeathAction extends Action {
	readonly deadMinions: readonly number[];

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
			.map(entityId => ActionHelper.getCardId(this.entities, entityId))
			.map(cardId => this.allCards.getCard(cardId))
			.map(card => card.name)
			.join(', ');
		const textRaw = `\t${deadMinionNames} die`;
		return Object.assign(new MinionDeathAction(this.allCards), this, { textRaw: textRaw });
	}

	protected getInstance(): Action {
		return new MinionDeathAction(this.allCards);
	}
}
