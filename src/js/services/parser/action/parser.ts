import { Action } from "../../../models/action/action";
import { HistoryItem } from "../../../models/history/history-item";
import { Game } from "../../../models/game/game";

export interface Parser {
    applies(item: HistoryItem): boolean;
    parse(item: HistoryItem, game: Game, currentTurn: number): Action[];
    reduce(actions: ReadonlyArray<Action>): ReadonlyArray<Action>;
}