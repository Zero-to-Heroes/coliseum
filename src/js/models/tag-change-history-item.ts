import { HistoryItem } from "./history-item";
import { EntityTag } from "./entity-tag";

export class TagChangeHistoryItem extends HistoryItem {

    readonly tag: EntityTag;

    constructor(tag: EntityTag, timestamp: number) {
        super(timestamp);
        this.tag = tag;
    }
}