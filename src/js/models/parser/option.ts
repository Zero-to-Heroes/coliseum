import { EnrichedTag } from "./enriched-tag";

export interface Option {
    readonly entity: number;
    readonly optionIndex: number;
    readonly error: number;
    readonly type: number;
    readonly parentIndex: number;
    readonly index: number;
}