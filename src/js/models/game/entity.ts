import { EntityDefinition } from '../parser/entity-definition';
import { Map } from 'immutable';
import { GameTag } from '../enums/game-tags';

export class Entity {
	constructor() {}

	readonly id: number;
	readonly cardID: string;
	readonly damageForThisAction: number;
	readonly tags: Map<string, number> = Map();

	public static create(base: Entity, newAttributes?: EntityDefinition): Entity {
		// Merge tags
		const newTags: Map<string, number> = newAttributes && newAttributes.tags ? newAttributes.tags : Map();
		const tags: Map<string, number> = (base.tags || Map()).merge(newTags);
		const newEntity: Entity = Object.assign(new Entity(), { ...base, ...newAttributes, tags });
		return newEntity;
	}

	public getCardType() {
		return this.getTag(GameTag.CARDTYPE);
	}

	public getTag(tag: GameTag): number {
		return !this.tags ? -1 : this.tags.get(GameTag[tag]);
	}

	public isRevealed(): boolean {
		// There are many tags that are set only when ShowEntity triggers. This is only
		// one of the possible choices
		const revealed =
			(this.getTag(GameTag.COST) && this.getTag(GameTag.COST) !== -1) ||
			// For some reasons it happens that the cost is not always set?
			(this.getTag(GameTag.CARDTYPE) && this.getTag(GameTag.CARDTYPE) !== -1);
		// console.log('revealed', revealed, this.id, this.cardID, this.tags.toJS());
		return revealed;
	}

	public zone(): number {
		return this.getTag(GameTag.ZONE);
	}

	public updateDamage(damage: number): Entity {
		const base: Entity = this;
		return Object.assign(new Entity(), { ...base, damageForThisAction: damage });
	}

	public update(definition: EntityDefinition): Entity {
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
		return Entity.create(this, newAttributes);
	}

	public updateTag(tag: GameTag, value: number): Entity {
		const newTags: Map<string, number> = this.tags.set(GameTag[tag], value);
		const base: Entity = this;
		return Object.assign(new Entity(), { ...base, tags: newTags });
	}
}
