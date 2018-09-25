export abstract class HistoryItem {
    readonly timestamp: number;

    constructor(timestamp: number) {
        this.timestamp = timestamp;
    }
}