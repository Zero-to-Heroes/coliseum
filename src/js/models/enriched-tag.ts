import { Tag } from 'sax';
import { EntityDefinition } from './entity-definition';
import { EntityTag } from './entity-tag';
import { Option } from './option';
import { MetaData } from './metadata';

export interface EnrichedTag extends Tag {
    readonly index?: number;
    readonly showEntities?: ReadonlyArray<EntityDefinition>;
    readonly fullEntities?: ReadonlyArray<EntityDefinition>;
    readonly hideEntities?: ReadonlyArray<number>;
    readonly tags?: ReadonlyArray<EntityTag>;
    readonly options?: ReadonlyArray<Option>;
    readonly meta?: ReadonlyArray<MetaData>;
    readonly parentIndex?: number;
}