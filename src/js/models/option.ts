import { EnrichedTag } from "./enriched-tag";

export interface Option {
    entity: number;
    optionIndex: number;
    error: number;
    type: number;
    parent: EnrichedTag;
    index: number;
}