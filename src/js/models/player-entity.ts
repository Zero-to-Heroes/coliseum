import { Entity } from "./entity";
import { EntityDefinition } from "./entity-definition";
import { Map } from "immutable";

export class PlayerEntity extends Entity {

    readonly playerId: number;

    public update(definition: EntityDefinition): PlayerEntity {
        const newAttributes: any = { };
        if (definition.cardID) {
            newAttributes.cardID = definition.cardID;
        }
        if (definition.name) {
            newAttributes.name = definition.name;
        }
        if (definition.tags) {
            newAttributes.tags = definition.tags;
            if (newAttributes.tags.PLAYSTATE == 8) {
                newAttributes.tags.CONCEDED = 1;
            }
        }
        return PlayerEntity.create(this, newAttributes);
    }

    public static create(base: PlayerEntity, newAttributes?: EntityDefinition): PlayerEntity {
        // Merge tags
        const newTags: Map<string, number> = (newAttributes && newAttributes.tags) 
                ? newAttributes.tags
                : Map();
        const tags: Map<string, number> = (base.tags || Map()).merge(newTags);
        const newEntity: PlayerEntity = Object.assign(new PlayerEntity(), {...base, ...newAttributes, tags});
        // console.log('creating new entity', newEntity, 'from', base, newAttributes);
        return newEntity;
    }
}