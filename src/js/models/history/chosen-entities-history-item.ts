import { HistoryItem } from "./history-item";
import { ChosenTag } from "../chosen-tag";

export class ChosenEntityHistoryItem extends HistoryItem {

    readonly tag: ChosenTag;

    constructor(tag: ChosenTag, timestamp: number) {
        super(timestamp);
        this.tag = tag;
    }
}