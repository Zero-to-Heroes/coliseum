import { Action } from './action';
import { Map } from 'immutable';
import { Entity } from '../game/entity';
import { AllCardsService } from '../../services/all-cards.service';
import { ActionHelper } from '../../services/parser/action/action-helper';

export class FatigueDamageAction extends Action {
	readonly controller: number;
	readonly amount: number;

	constructor(private allCards: AllCardsService) {
		super();
	}

	public static create(newAction, allCards: AllCardsService): FatigueDamageAction {
		return Object.assign(new FatigueDamageAction(allCards), newAction);
	}

	public update(entities: Map<number, Entity>): FatigueDamageAction {
		return Object.assign(this.getInstance(), this, { entities: entities });
	}

	public enrichWithText(): FatigueDamageAction {
		const playerName = ActionHelper.getOwner(this.entities, this.controller).name;
		const textRaw = `\t${playerName} takes ${this.amount} fatigue damage`;
		return Object.assign(this.getInstance(), this, { textRaw: textRaw });
	}

	protected getInstance(): Action {
		return new FatigueDamageAction(this.allCards);
	}
}
