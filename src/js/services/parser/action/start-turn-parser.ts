import { Parser } from "./parser";
import { HistoryItem } from "../../../models/history/history-item";
import { ActionHistoryItem } from "../../../models/history/action-history-item";
import { Action } from "../../../models/action/action";
import { TagChangeHistoryItem } from "../../../models/history/tag-change-history-item";
import { GameTag } from "../../../models/enums/game-tags";
import { StartTurnAction } from "../../../models/action/start-turn-action";
import { Map } from "immutable";
import { Entity } from "../../../models/game/entity";
import { Step } from "../../../models/enums/step";
import { PlayerEntity } from "../../../models/game/player-entity";

export class StartTurnParser implements Parser {

    public applies(item: HistoryItem): boolean {
        return item instanceof TagChangeHistoryItem 
                && item.tag.tag === GameTag.STEP 
                && item.tag.value === Step.MAIN_READY;
    }

    public parse(
            item: ActionHistoryItem, 
            currentTurn: number, 
            entitiesBeforeAction: Map<number, Entity>,
            history: ReadonlyArray<HistoryItem>): Action[] {
        const activePlayerId = entitiesBeforeAction
                .filter(entity => entity.getTag(GameTag.CURRENT_PLAYER) === 1)
                .map(entity => entity as PlayerEntity)
                .first()
                .playerId;
        return [StartTurnAction.create({
            timestamp: item.timestamp,
            turn: currentTurn + 1,
            activePlayer: activePlayerId,
            index: item.index
        })];
    }

    public reduce(actions: ReadonlyArray<Action>): ReadonlyArray<Action> {
        return actions;
    }
}