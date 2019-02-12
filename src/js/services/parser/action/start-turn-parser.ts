import { Parser } from "./parser";
import { HistoryItem } from "../../../models/history/history-item";
import { ActionHistoryItem } from "../../../models/history/action-history-item";
import { Action } from "../../../models/action/action";
import { TagChangeHistoryItem } from "../../../models/history/tag-change-history-item";
import { GameTag } from "../../../models/enums/game-tags";
import { StartTurnAction } from "../../../models/action/start-turn-action";
import { Map } from "immutable";
import { Entity } from "../../../models/game/entity";

export class StartTurnParser implements Parser {

    public applies(item: HistoryItem): boolean {
        return item instanceof TagChangeHistoryItem && item.tag.tag == GameTag.TURN;
    }

    public parse(
        item: ActionHistoryItem, 
        currentTurn: number, 
        entitiesBeforeAction: Map<number, Entity>,
        history: ReadonlyArray<HistoryItem>): Action[] {
        return [StartTurnAction.create({
            timestamp: item.timestamp,
            turn: currentTurn,
            index: item.index
        })];
    }

    public reduce(actions: ReadonlyArray<Action>): ReadonlyArray<Action> {
        return actions;
    }
}