import { Action } from "../../../models/action/action";
import { HistoryItem } from "../../../models/history/history-item";
import { Entity } from "../../../models/game/entity";
import { Map } from "immutable";
import { PlayerEntity } from "../../../models/game/player-entity";

export interface Parser {
    applies(item: HistoryItem): boolean;
    parse(
        item: HistoryItem, 
        currentTurn: number, 
        entitiesBeforeAction: Map<number, Entity>,
        history: ReadonlyArray<HistoryItem>,
        players?: ReadonlyArray<PlayerEntity>): Action[];
    reduce(actions: ReadonlyArray<Action>): ReadonlyArray<Action>;
}