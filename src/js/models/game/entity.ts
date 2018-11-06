import { EntityDefinition } from "../parser/entity-definition";
import { Map, fromJS } from "immutable";
import { GameTag } from "../enums/game-tags";

export class Entity {

    readonly id: number;
    readonly cardID: string;
    readonly tags: Map<string, number> = Map();

    constructor() { }

    public getCardType() {
        return this.getTag(GameTag.CARDTYPE);
    }

    public getTag(tag: GameTag): number {
        return this.tags.get(GameTag[tag]);
    }

    public isRevealed(): boolean {
        console.log('is revealed?', this, !!this.cardID);
        return !!this.cardID;
    }

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
            if (newAttributes.tags.PLAYSTATE == 8) {
                newAttributes.tags.CONCEDED = 1;
            }
        }
        // console.log('\tcreating with new attributes', newAttributes);
        return Entity.create(this, newAttributes);
    }

    public updateTag(tag: GameTag, value: number): Entity {
        const newTags: Map<string, number> = this.tags
                .set(GameTag[tag], value);
        const base: Entity = this;
        return Object.assign(new Entity(), {...base, tags: newTags});
    }

    public static create(base: Entity, newAttributes?: EntityDefinition): Entity {
        // Merge tags
        const newTags: Map<string, number> = (newAttributes && newAttributes.tags) 
                ? newAttributes.tags
                : Map();
        // console.log('\tcreating with new tags', newTags.toJS());
        const tags: Map<string, number> = (base.tags || Map()).merge(newTags);
        // console.log('\tmerged tags', tags.toJS());
        const newEntity: Entity = Object.assign(new Entity(), {...base, ...newAttributes, tags});
        // console.log('\tnewEntity', newEntity, newEntity.tags.toJS());
        // console.log('creating new entity', newEntity, 'from', base, newAttributes);
        return newEntity;
    }
}