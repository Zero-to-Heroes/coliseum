import { Injectable } from '@angular/core';
import { Map } from "immutable";
import { HistoryItem } from '../../models/history/history-item';
import { TagChangeHistoryItem } from '../../models/history/tag-change-history-item';
import { GameTag } from '../../models/enums/game-tags';
import { Game } from '../../models/game/game';
import { Turn } from '../../models/game/turn';
import { Action } from '../../models/action/action';
import { Parser } from './action/parser';
import { MulliganCardParser } from './action/mulligan-card-parser';
import { GameHepler } from '../../models/game/game-helper';
import { CardDrawParser } from './action/card-draw-parser';

@Injectable()
export class ActionParserService {

    private currentTurn: number = 0;

    constructor() {
    }

	public parseActions(game: Game, history: ReadonlyArray<HistoryItem>): Game {
        this.currentTurn = 0;
        let actionsForTurn: ReadonlyArray<Action> = [];
        let turns: Map<number, Turn> = Map<number, Turn>();
        // Recreating this every time lets the parsers store state and emit the action only when necessary
        const actionParsers: Parser[] = this.registerActionParsers(); 

        for (const item of history) {
            const updatedTurn: Turn = this.updateCurrentTurn(item, game, actionsForTurn);
            if (updatedTurn) {
                turns = turns.set(updatedTurn.turn == 'mulligan' ? 0 : parseInt(updatedTurn.turn), updatedTurn);
                actionsForTurn = [];
            }

            actionParsers.forEach((parser) => {
                if (parser.applies(item)) {
                    const actions: Action[] = parser.parse(item, game, this.currentTurn);
                    if (actions && actions.length > 0) {
                        actionsForTurn = [...actionsForTurn, ...actions];
                    }
                }
            });

            // TODO: add last actions to the final result
        }
        actionsForTurn = [];

        return Game.createGame(game, { turns: turns });
    }
    
    private updateCurrentTurn(item: HistoryItem, game: Game, actions: ReadonlyArray<Action>): Turn {
        if (item instanceof TagChangeHistoryItem 
                && GameHepler.isGameEntity(item.tag.entity, game)
                && item.tag.tag == GameTag.TURN) {
            let turnToUpdate: Turn = game.turns.get(this.currentTurn);
            if (!turnToUpdate) {
                console.warn('could not find turn to update', item, this.currentTurn, game.turns.toJS());
            }
            turnToUpdate = turnToUpdate.update({ actions: actions });
            this.currentTurn = item.tag.value - 1;
            return turnToUpdate;
        }
        return null;
    }

    private registerActionParsers(): Parser[] {
        return [
            new MulliganCardParser(),
            new CardDrawParser(),
        ];
    }
}
