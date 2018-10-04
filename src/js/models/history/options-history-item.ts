import { HistoryItem } from "./history-item";
import { EnrichedTag } from "../enriched-tag";

export class OptionsHistoryItem extends HistoryItem {

    readonly tag: EnrichedTag;

    constructor(tag: EnrichedTag, timestamp: number) {
        super(timestamp);
        this.tag = tag;
    }
}