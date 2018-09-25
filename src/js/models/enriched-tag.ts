import { Tag } from 'sax';
import { EntityDefinition } from './entity-definition';
import { EntityTag } from './entity-tag';
import { Option } from './option';
import { MetaData } from './metadata';

export interface EnrichedTag extends Tag {
    index?: number;
    showEntities?: EntityDefinition[];
    fullEntities?: EntityDefinition[];
    hideEntities?: number[];
    tags?: EntityTag[];
    options?: Option[];
    meta?: MetaData[];
    parent?: EnrichedTag;
}