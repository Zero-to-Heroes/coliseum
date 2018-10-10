import { HistoryItem } from "./history-item";
import { EnrichedTag } from "../enriched-tag";

export class ActionHistoryItem extends HistoryItem {

    readonly node: EnrichedTag;

    constructor(node: EnrichedTag, timestamp: number, index: number) {
        super(timestamp, index);
        this.node = node;
    }
}