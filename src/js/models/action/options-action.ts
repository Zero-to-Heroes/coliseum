import { Action } from './action';
import { Map } from 'immutable';
import { Entity } from '../game/entity';
import { AllCardsService } from '../../services/all-cards.service';

export class OptionsAction extends Action {
	readonly options: ReadonlyArray<number>;

	constructor(private allCards: AllCardsService) {
		super();
	}

	public static create(newAction, allCards: AllCardsService): OptionsAction {
		return Object.assign(new OptionsAction(allCards), newAction);
	}

	public update(entities: Map<number, Entity>): OptionsAction {
		return Object.assign(this.getInstance(), this, { entities: entities });
	}

	public enrichWithText(): OptionsAction {
		const textRaw = '';
		return Object.assign(this.getInstance(), this, { textRaw: textRaw });
	}

	protected getInstance(): Action {
		return new OptionsAction(this.allCards);
	}
}
