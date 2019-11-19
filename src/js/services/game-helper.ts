import { Entity } from '@firestone-hs/replay-parser';

export class GameHelper {
	public static getOptions(zone: readonly Entity[], options: readonly number[]): readonly number[] {
		return zone
			.filter(entity => entity)
			.map(entity => entity.id)
			.filter(id => options && options.indexOf(id) !== -1);
	}
}
