import { EntityDefinitionAttribute } from './entity-definition-attribute';
import { Map } from 'immutable';

export interface EntityDefinition {
	readonly id?: number;
	readonly cardID?: string;
	readonly playerID?: number;
	readonly name?: string;
	readonly tags: Map<string, number>;
	readonly attributes?: EntityDefinitionAttribute;
	readonly index?: number;
	readonly parentIndex?: number;
}
