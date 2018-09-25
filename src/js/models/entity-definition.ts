import { EntityDefinitionAttribute } from "./entity-definition-attribute";
import { EnrichedTag } from "./enriched-tag";

export interface EntityDefinition {
    id?: number;
    cardID?: string;
    name?: string;
    tags;
    attributes?: EntityDefinitionAttribute;
    index?: number;
    parent?: EnrichedTag;
}