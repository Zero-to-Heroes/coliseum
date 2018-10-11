import { Tag } from 'sax';
import { EntityDefinition } from './entity-definition';
import { EntityTag } from './entity-tag';
import { Option } from './option';
import { MetaData } from './metadata';

export interface EnrichedTag extends Tag {
    index?: number;
    showEntities?: ReadonlyArray<EntityDefinition>;
    fullEntities?: ReadonlyArray<EntityDefinition>;
    hideEntities?: ReadonlyArray<number>;
    tags?: ReadonlyArray<EntityTag>;
    options?: ReadonlyArray<Option>;
    meta?: ReadonlyArray<MetaData>;
    readonly parentIndex?: number;
}