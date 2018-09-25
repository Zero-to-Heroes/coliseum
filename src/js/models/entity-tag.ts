import { EnrichedTag } from "./enriched-tag";
import { GameTag } from "./game-tags";

export interface EntityTag {
    entity: number;
    tag: GameTag;
    value: number;
    parent: EnrichedTag;
    index: number;
}