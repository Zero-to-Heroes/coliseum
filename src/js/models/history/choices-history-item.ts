import { HistoryItem } from "./history-item";
import { EntityDefinition } from "../entity-definition";
import { Choices } from "../choices";

export class ChoicesHistoryItem extends HistoryItem {

    readonly choices: Choices;

    constructor(choices: Choices, timestamp: number) {
        super(timestamp);
        this.choices = choices;
    }
}