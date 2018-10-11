import { Parser } from "./parser";
import { HistoryItem } from "../../../models/history/history-item";
import { ActionHistoryItem } from "../../../models/history/action-history-item";
import { Game } from "../../../models/game/game";
import { CardType } from "../../../models/enums/card-type";
import { MulliganCardAction } from "../../../models/action/mulligan-card-action";
import { GameHepler } from "../../../models/game/game-helper";
import { Action } from "../../../models/action/action";

export class MulliganCardParser implements Parser {

    public applies(item: HistoryItem): boolean {
        return item instanceof ActionHistoryItem;
    }

    public parse(item: ActionHistoryItem, game: Game, currentTurn: number): Action[] {
        if (currentTurn > 0) {
            return;
        }
        // Adding the cards mulliganed by the player
        if (parseInt(item.node.attributes.type) == CardType.ABILITY 
                && item.node.hideEntities
                && GameHepler.isPlayerEntity(parseInt(item.node.attributes.entity), game)) {
            return [MulliganCardAction.create({
                timestamp: item.timestamp,
                index: item.index,
                playerMulligan: item.node.hideEntities
            })];
        }
        // TODO: Opponent mulligan
        return null;
    }
}