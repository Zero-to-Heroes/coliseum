import { Entity } from './entity';
import { PlayerEntity } from './player-entity';
import { Turn } from './turn';
import { Map } from 'immutable';

export class Game {
	readonly entities: Map<number, Entity>;
	readonly players: readonly PlayerEntity[] = [];
	readonly turns: Map<number, Turn> = Map<number, Turn>();
	readonly fullStoryRaw: string;

	private constructor() {}

	public static createGame(baseGame: Game, newAttributes?: any): Game {
		return Object.assign(new Game(), { ...baseGame }, { ...newAttributes });
	}
}
