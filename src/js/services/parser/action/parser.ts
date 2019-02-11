import { Action } from "../../../models/action/action";
import { HistoryItem } from "../../../models/history/history-item";
import { Entity } from "../../../models/game/entity";
import { Map } from "immutable";

export interface Parser {
    applies(item: HistoryItem): boolean;
    parse(item: HistoryItem, entities: Map<number, Entity>, currentTurn: number): Action[];
    reduce(actions: ReadonlyArray<Action>): ReadonlyArray<Action>;
}