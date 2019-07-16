import { Action } from './action';
import { Map } from 'immutable';
import { Entity } from '../game/entity';

export class StartTurnAction extends Action {
	readonly turn: number;
	readonly isStartOfMulligan: boolean;

	public static create(newAction): StartTurnAction {
		return Object.assign(new StartTurnAction(), newAction);
	}

	public update(entities: Map<number, Entity>): StartTurnAction {
		return Object.assign(new StartTurnAction(), this, { entities: entities });
	}

	public enrichWithText(): StartTurnAction {
		const textRaw = this.turn === 0 ? 'Start of mulligan' : 'Start of turn ' + this.turn;
		return Object.assign(new StartTurnAction(), this, { textRaw: textRaw });
	}

	protected getInstance(): Action {
		return new StartTurnAction();
	}
}
