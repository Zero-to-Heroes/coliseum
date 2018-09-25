import { EntityDefinition } from "./entity-definition";
import { Map } from "immutable";
import { GameTag } from "./game-tags";

export class Entity {

    readonly id: number;
    readonly cardID: string;
    readonly tags: Map<string, number> = Map();

    private constructor() { }

    public update(definition: EntityDefinition): Entity {
        const newAttributes: any = { };
        if (definition.cardID) {
            newAttributes.cardID = definition.cardID;
        }
        if (definition.name) {
            newAttributes.name = definition.name;
        }
        if (definition.tags) {
            newAttributes.tags = definition.tags;
            if (definition.tags.PLAYSTATE == 8) {
                definition.tags.CONCEDED = 1;
            }
        }
        return Entity.create(this, newAttributes);
    }

    public static create(base: Entity, newAttributes?: any): Entity {
        // Merge tags
        const newTags: Map<string, number> = (newAttributes && newAttributes.tags) 
                ? Map(newAttributes.tags)
                : Map();
        const tags: Map<string, number> = (base.tags || Map()).merge(newTags);
        const newEntity: Entity = Object.assign(new Entity(), {...base, ...newAttributes, tags});
        // console.log('creating new entity', newEntity, 'from', base, newAttributes);
        return newEntity;
    }
}