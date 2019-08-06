import { Action } from './action';
import { Map } from 'immutable';
import { Entity } from '../game/entity';
import { PlayState } from '../enums/playstate';
import { ActionHelper } from '../../services/parser/action/action-helper';

export class EndGameAction extends Action {
	readonly winStatus: readonly [number, number][];
	readonly entityId: number;
	readonly opponentId: number;

	public static create(newAction): EndGameAction {
		return Object.assign(new EndGameAction(), newAction);
	}

	public update(entities: Map<number, Entity>): EndGameAction {
		return Object.assign(this.getInstance(), this, { entities: entities });
	}

	public enrichWithText(): EndGameAction {
		let concededText = '';
		for (const status of this.winStatus) {
			if (status[1] === PlayState.CONCEDED) {
				const name = ActionHelper.getOwner(this.entities, status[0]).name;
				concededText = `${name} conceded, `;
			}
		}
		let winText = '';
		for (const status of this.winStatus) {
			if (status[1] !== PlayState.CONCEDED && status[1] !== PlayState.TIED && status[0] === this.entityId) {
				const name = ActionHelper.getOwner(this.entities, this.entityId).name;
				const statusString = status[1] === PlayState.WON ? 'won' : 'lost';
				winText = `${name} ${statusString}!`;
			}
		}

		let textRaw = '';
		if (!winText && this.winStatus.some(status => status[1] === PlayState.TIED)) {
			textRaw = 'Both players tied';
		} else {
			textRaw = `${concededText}${winText}`;
		}
		return Object.assign(this.getInstance(), this, { textRaw: textRaw });
	}

	protected getInstance(): Action {
		return new EndGameAction();
	}
}
