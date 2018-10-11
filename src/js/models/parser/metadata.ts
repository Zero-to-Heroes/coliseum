import { EnrichedTag } from "./enriched-tag";
import { Info } from "./info";

export interface MetaData {
    readonly meta: string;
    readonly data: number;
    readonly parentIndex: number;
    readonly ts: number;
    readonly index: number;
    readonly info: ReadonlyArray<Info>;
}