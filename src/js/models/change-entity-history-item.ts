import { HistoryItem } from "./history-item";
import { EntityDefinition } from "./entity-definition";

export class ChangeEntityHistoryItem extends HistoryItem {

    readonly entityDefintion: EntityDefinition;

    constructor(entityDefintion: EntityDefinition, timestamp: number) {
        super(timestamp);
        this.entityDefintion = entityDefintion;
    }
}