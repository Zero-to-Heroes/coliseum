import { Tag } from 'sax';
import { EntityDefinition } from './entity-definition';
import { EntityTag } from './entity-tag';
import { Option } from './option';
import { MetaData } from './metadata';

export interface EnrichedTag extends Tag {
	index?: number;
	showEntities?: readonly EntityDefinition[];
	fullEntities?: readonly EntityDefinition[];
	hideEntities?: readonly number[];
	tags?: readonly EntityTag[];
	options?: readonly Option[];
	meta?: readonly MetaData[];
	parentIndex?: number;
}
