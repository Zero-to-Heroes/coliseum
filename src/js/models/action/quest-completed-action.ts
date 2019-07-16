import { Action } from './action';
import { Map } from 'immutable';
import { Entity } from '../game/entity';
import { AllCardsService } from '../../services/all-cards.service';
import { ActionHelper } from '../../services/parser/action/action-helper';

export class QuestCompletedAction extends Action {
	readonly originId: number;

	constructor(private allCards: AllCardsService) {
		super();
	}

	public static create(newAction, allCards: AllCardsService): QuestCompletedAction {
		return Object.assign(new QuestCompletedAction(allCards), newAction);
	}

	public update(entities: Map<number, Entity>): QuestCompletedAction {
		return Object.assign(this.getInstance(), this, { entities: entities });
	}

	public enrichWithText(): QuestCompletedAction {
		const questCardId = ActionHelper.getCardId(this.entities, this.originId);
		const questName = this.allCards.getCard(questCardId).name;
		const playerName = ActionHelper.getOwner(this.entities, this.originId).name;
		const textRaw = `\t${playerName} completes ${questName}!`;
		return Object.assign(this.getInstance(), this, { textRaw: textRaw });
	}

	protected getInstance(): Action {
		return new QuestCompletedAction(this.allCards);
	}
}
