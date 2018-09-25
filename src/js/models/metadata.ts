import { EnrichedTag } from "./enriched-tag";
import { Info } from "./info";

export interface MetaData {
    meta: string;
    data: number;
    parent: EnrichedTag;
    ts: number;
    index: number;
    info: Info[];
}