import { Parser } from "./parser";
import { HistoryItem } from "../../../models/history/history-item";
import { ActionHistoryItem } from "../../../models/history/action-history-item";
import { Action } from "../../../models/action/action";
import { TagChangeHistoryItem } from "../../../models/history/tag-change-history-item";
import { GameTag } from "../../../models/enums/game-tags";
import { StartTurnAction } from "../../../models/action/start-turn-action";
import { Map } from "immutable";
import { Entity } from "../../../models/game/entity";
import { Mulligan } from "../../../models/enums/mulligan";

export class EndOfMulliganParser implements Parser {

    private numberOfMulligansDone = 0;

    public applies(item: HistoryItem): boolean {
        return item instanceof TagChangeHistoryItem 
                && item.tag.tag === GameTag.MULLIGAN_STATE
                && item.tag.value === Mulligan.DONE;
    }

    public parse(
            item: ActionHistoryItem, 
            currentTurn: number, 
            entitiesBeforeAction: Map<number, Entity>,
            history: ReadonlyArray<HistoryItem>): Action[] {
        this.numberOfMulligansDone++;
        if (this.numberOfMulligansDone == 2) {
            return [StartTurnAction.create({
                timestamp: item.timestamp,
                turn: currentTurn,
                index: item.index
            })];
        }
        return [];
    }

    public reduce(actions: ReadonlyArray<Action>): ReadonlyArray<Action> {
        return actions;
    }
}