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
import { NGXLogger } from 'ngx-logger';
import { StartTurnParser } from './action/start-turn-parser';
import { AllCardsService } from '../all-cards.service';
import { HeroPowerUsedParser } from './action/hero-power-used-parser';
import { Entity } from '../../models/game/entity';
import { StateProcessorService } from './state-processor.service';
import { CardPlayedFromHandParser } from './action/card-played-from-hand-parser';

@Injectable()
export class ActionParserService {

    private currentTurn: number = 0;

    constructor(private logger: NGXLogger, private allCards: AllCardsService, private stateProcessorService: StateProcessorService) {
    }

	public parseActions(game: Game, history: ReadonlyArray<HistoryItem>): Game {
        this.currentTurn = 0;
        let actionsForTurn: ReadonlyArray<Action> = [];
        let previousStateEntities: Map<number, Entity> = game.entities;
        let turns: Map<number, Turn> = Map<number, Turn>();
        // Recreating this every time lets the parsers store state and emit the action only when necessary
        const actionParsers: Parser[] = this.registerActionParsers(); 

        for (const item of history) {
            const updatedTurn: Turn = this.updateCurrentTurn(item, game, actionsForTurn);
            if (updatedTurn) {
                // Give an opportunity to each parser to "reduce" the action it produced by merging them
                // For instance, if we two card draws in a row, we might want to display them as a single 
                // action that draws two cards
                actionsForTurn = this.reduceActions(actionParsers, actionsForTurn);
                const turnWithNewActions = updatedTurn.update({actions: actionsForTurn});
                turns = turns.set(turnWithNewActions.turn == 'mulligan' ? 0 : parseInt(turnWithNewActions.turn), turnWithNewActions);
                actionsForTurn = [];
            }

            let newStateEntities = this.stateProcessorService.applyHistory(previousStateEntities, item);
            actionParsers.forEach((parser) => {
                if (parser.applies(item)) {
                    const actions: Action[] = parser.parse(item, this.currentTurn, previousStateEntities, newStateEntities);
                    if (actions && actions.length > 0) {
                        actionsForTurn = [...actionsForTurn, ...actions];
                    }
                }
            });

            // Update the state of the game to reflect the latest action
            previousStateEntities = newStateEntities;
            // TODO: add last actions to the final result
        }
        actionsForTurn = [];

        return Game.createGame(game, { turns: turns });
    }
    
    private updateCurrentTurn(item: HistoryItem, game: Game, actions: ReadonlyArray<Action>): Turn {
        if (item instanceof TagChangeHistoryItem 
                && GameHepler.isGameEntity(item.tag.entity, game.entities)
                && item.tag.tag == GameTag.TURN) {
            let turnToUpdate: Turn = game.turns.get(this.currentTurn);
            if (!turnToUpdate) {
                this.logger.warn('could not find turn to update', item, this.currentTurn, game.turns.toJS());
            }
            turnToUpdate = turnToUpdate.update({ actions: actions });
            this.currentTurn = item.tag.value - 1;
            return turnToUpdate;
        }
        return null;
    }
    
    private reduceActions(actionParsers: Parser[], actionsForTurn: ReadonlyArray<Action>): ReadonlyArray<Action> {
        let reducedActions = actionsForTurn;
        for (const parser of actionParsers) {
            reducedActions = parser.reduce(reducedActions);
        }
        return reducedActions;
    }

    private registerActionParsers(): Parser[] {
        return [
            new StartTurnParser(),
            new MulliganCardParser(this.allCards, this.logger),
            new CardDrawParser(this.allCards),
            new HeroPowerUsedParser(this.allCards),
            new CardPlayedFromHandParser(this.allCards),
        ];
    }
}
