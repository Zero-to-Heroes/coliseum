import { Entity, GameEntity } from '@firestone-hs/replay-parser';
import { Map } from 'immutable';

export class GameHelper {
	public static getOptions(zone: readonly Entity[], options: readonly number[]): readonly number[] {
		return zone
			.filter(entity => entity)
			.map(entity => entity.id)
			.filter(id => options && options.indexOf(id) !== -1);
	}

	public static getGameEntity(entities: Map<number, Entity>): Entity {
		return entities ? entities.toArray().find(entity => entity instanceof GameEntity) : null;
	}
}
