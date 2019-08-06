import { Map } from 'immutable';
import { Entity } from '../game/entity';
import { PlayState } from '../enums/playstate';

export abstract class Action {
	readonly timestamp: number;
	readonly index: number;
	readonly textRaw: string;

	// Game state information
	readonly entities: Map<number, Entity>;
	readonly crossedEntities: readonly number[] = [];
	readonly highlightedEntities: readonly number[];
	readonly activeSpell: number;
	readonly activePlayer: number;
	readonly isMulligan: boolean;
	readonly isEndGame: boolean;
	readonly endGameStatus: PlayState;
	readonly targets: readonly [number, number][];
	readonly options: readonly number[] = [];
	// This is part of the global action, because damage actions can be merged
	// into non-damage ones
	readonly damages: Map<number, number> = Map.of();

	protected abstract getInstance(): Action;
	abstract update(entities: Map<number, Entity>): Action;
	abstract enrichWithText(): Action;

	public updateAction<T extends Action>(newAction: T): T {
		return Object.assign(this.getInstance(), this, newAction);
	}
}
