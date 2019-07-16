import { Turn } from './turn';

export class ActionTurn extends Turn {
	readonly activePlayer: number;

	public update(newTurn): ActionTurn {
		return Object.assign(new ActionTurn(), this, newTurn);
	}
}
