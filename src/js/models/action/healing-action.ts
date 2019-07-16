import { Action } from './action';
import { Map } from 'immutable';
import { Entity } from '../game/entity';
import { AllCardsService } from '../../services/all-cards.service';
import { ActionHelper } from '../../services/parser/action/action-helper';

export class HealingAction extends Action {

	constructor(private allCards: AllCardsService) {
		super();
	}

	public static create(newAction, allCards: AllCardsService): HealingAction {
		return Object.assign(new HealingAction(allCards), newAction);
	}

	public update(entities: Map<number, Entity>): HealingAction {
		return Object.assign(new HealingAction(this.allCards), this, { entities: entities });
	}

	public enrichWithText(): HealingAction {
		const textRaw = '\t' + this.damages
				.map((amount, entityId) => {
					const entityCardId = ActionHelper.getCardId(this.entities, entityId);
					const entityCard = this.allCards.getCard(entityCardId);
					return `${entityCard.name} heals for ${-amount}`;
				})
				.join(', ');
		return Object.assign(new HealingAction(this.allCards), this, { textRaw: textRaw });
	}

	protected getInstance(): Action {
		return new HealingAction(this.allCards);
	}
}
