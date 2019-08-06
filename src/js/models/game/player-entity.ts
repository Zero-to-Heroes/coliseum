import { Entity } from './entity';
import { EntityDefinition } from '../parser/entity-definition';
import { Map } from 'immutable';
import { GameTag } from '../enums/game-tags';

export class PlayerEntity extends Entity {
	readonly playerId: number;
	readonly name: string;

	public static create(base: PlayerEntity, newAttributes?: EntityDefinition): PlayerEntity {
		// Merge tags
		const newTags: Map<string, number> = newAttributes && newAttributes.tags ? newAttributes.tags : Map();
		const tags: Map<string, number> = (base.tags || Map()).merge(newTags);
		const newEntity: PlayerEntity = Object.assign(new PlayerEntity(), { ...base, ...newAttributes, tags });
		return newEntity;
	}

	public update(definition: EntityDefinition): PlayerEntity {
		const newAttributes: any = {};
		if (definition.cardID) {
			newAttributes.cardID = definition.cardID;
		}
		if (definition.name) {
			newAttributes.name = definition.name;
		}
		if (definition.tags) {
			newAttributes.tags = definition.tags;
			if (newAttributes.tags.PLAYSTATE === 8) {
				newAttributes.tags.CONCEDED = 1;
			}
		}
		return PlayerEntity.create(this, newAttributes);
	}

	public updateDamage(damage: number): PlayerEntity {
		const base: PlayerEntity = this;
		return Object.assign(new PlayerEntity(), { ...base, damageForThisAction: damage });
	}

	public updateTag(tag: GameTag, value: number): PlayerEntity {
		const newTags: Map<string, number> = this.tags.set(GameTag[tag], value);
		const base: PlayerEntity = this;
		return Object.assign(new PlayerEntity(), { ...base, tags: newTags });
	}
}
