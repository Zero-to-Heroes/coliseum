import { HistoryItem } from "./history-item";
import { EntityDefinition } from "../parser/entity-definition";
import { Choices } from "../parser/choices";

export class ChoicesHistoryItem extends HistoryItem {

    readonly choices: Choices;

    constructor(choices: Choices, timestamp: number, index: number) {
        super(timestamp, index);
        this.choices = choices;
    }
}