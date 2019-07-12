import { Injectable } from '@angular/core';
import { Map } from "immutable";
import { HistoryItem } from '../../../models/history/history-item';
import { Game } from '../../../models/game/game';
import { Turn } from '../../../models/game/turn';
import { Action } from '../../../models/action/action';
import { Parser } from '../action/parser';
import { MulliganCardParser } from '../action/mulligan-card-parser';
import { CardDrawParser } from '../action/card-draw-parser';
import { NGXLogger } from 'ngx-logger';
import { StartTurnParser } from '../action/start-turn-parser';
import { AllCardsService } from '../../all-cards.service';
import { HeroPowerUsedParser } from '../action/hero-power-used-parser';
import { Entity } from '../../../models/game/entity';
import { StateProcessorService } from '../state-processor.service';
import { CardPlayedFromHandParser } from '../action/card-played-from-hand-parser';
import { AttackParser } from '../action/attack-parser';
import { MinionDeathParser } from '../action/minion-death-parser';
import { PowerTargetParser } from '../action/power-target-parser';
import { CardTargetParser } from '../action/card-target-parser';
import { DiscoverParser } from '../action/discover-parser';
import { SummonsParser } from '../action/summons-parser';
import { StartTurnAction } from '../../../models/action/start-turn-action';
import { StartOfMulliganParser } from '../action/start-of-mulligan-parser';
import { SecretPlayedFromHandParser } from '../action/secret-played-from-hand-parser';
import { SecretRevealedParser } from '../action/secret-revealed-parser';
import { AttachingEnchantmentParser } from '../action/attaching-enchantment-parser';
import { DamageParser } from '../action/damage-parser';
import { DiscoveryPickParser } from '../action/discovery-pick-parser';
import { MulliganCardChoiceParser } from '../action/mulligan-card-choice-parser';
import { CardDiscardParser } from '../action/card-discard-parser';
import { OptionsParser } from '../action/options-parser';
import { EndGameParser } from '../action/end-game-parser';
import { CardBurnParser } from '../action/card-burn-parser';
import { FatigueDamageParser } from '../action/fatigue-damage-parser';

@Injectable()
export class ActionParserService {

    private currentTurn: number = 0;

    constructor(private logger: NGXLogger, private allCards: AllCardsService, private stateProcessorService: StateProcessorService) {
    }

    private registerActionParsers(): Parser[] {
        return [
            new StartTurnParser(),
            new MulliganCardParser(this.allCards, this.logger),
            new MulliganCardChoiceParser(this.allCards, this.logger),
            new StartOfMulliganParser(),
            new CardDrawParser(this.allCards, this.logger),
            new CardBurnParser(this.allCards, this.logger),
            new HeroPowerUsedParser(this.allCards),
            new CardPlayedFromHandParser(this.allCards),
            new SecretPlayedFromHandParser(this.allCards),
            new AttackParser(this.allCards),
            new MinionDeathParser(this.allCards),
            new PowerTargetParser(this.allCards, this.logger),
            new CardTargetParser(this.allCards, this.logger),
            new DiscoverParser(this.allCards),
            new DiscoveryPickParser(this.allCards, this.logger),
            new SummonsParser(this.allCards),
            new SecretRevealedParser(this.allCards),
            new AttachingEnchantmentParser(this.allCards),
            new DamageParser(this.allCards, this.logger),
            new CardDiscardParser(this.allCards, this.logger),
            new OptionsParser(this.allCards, this.logger),
            new EndGameParser(this.logger),
            new FatigueDamageParser(this.allCards, this.logger),
        ];
    }

	public parseActions(game: Game, history: ReadonlyArray<HistoryItem>): Game {
        this.currentTurn = 0;
        let actionsForTurn: ReadonlyArray<Action> = [];
        let previousStateEntities: Map<number, Entity> = game.entities;
        let previousProcessedItem: HistoryItem = history[0];
        let turns: Map<number, Turn> = Map<number, Turn>();
        // Recreating this every time lets the parsers store state and emit the action only when necessary
        const actionParsers: Parser[] = this.registerActionParsers(); 

        for (const item of history) {
            actionParsers.forEach((parser) => {
                if (parser.applies(item)) {
                    // When we perform an action, we want to show the result of the state updates until the next action is 
                    // played.
                    previousStateEntities = this.stateProcessorService.applyHistoryUntilNow(
                        previousStateEntities, history, previousProcessedItem, item);
                    const actions: Action[] = parser.parse(item, this.currentTurn, previousStateEntities, history, game.players);
                    if (actions && actions.length > 0) {
                        actionsForTurn = this.fillMissingEntities(actionsForTurn, previousStateEntities);
                        actionsForTurn = [...actionsForTurn, ...actions];
                        previousProcessedItem = item;
                    }
                }
            });

            const updatedTurn: Turn = this.updateCurrentTurn(item, game, actionsForTurn);
            if (updatedTurn) {
                // The last action is a start turn action, which we want to keep for the start 
                // of the next turn instead
                const lastAction = actionsForTurn[actionsForTurn.length - 1];
                actionsForTurn = actionsForTurn.slice(0, actionsForTurn.length - 1);
                previousStateEntities = this.stateProcessorService.applyHistoryUntilNow(
                    previousStateEntities, history, previousProcessedItem, item);
                actionsForTurn = this.fillMissingEntities(actionsForTurn, previousStateEntities);
                // Sort actions based on their index (so that actions that were created from the same 
                // parent action can have a custom order)
                actionsForTurn = this.sortActions(actionsForTurn, (a: Action, b: Action) => a.index - b.index);
                // Give an opportunity to each parser to combine the actions it produced by merging them
                // For instance, if we two card draws in a row, we might want to display them as a single 
                // action that draws two cards
                actionsForTurn = this.reduceActions(actionParsers, actionsForTurn);
                actionsForTurn = this.addDamageToEntities(actionsForTurn, previousStateEntities);
                const turnWithNewActions = updatedTurn.update({actions: actionsForTurn});
                turns = turns.set(turnWithNewActions.turn == 'mulligan' ? 0 : parseInt(turnWithNewActions.turn), turnWithNewActions);
                actionsForTurn = [lastAction];
                previousProcessedItem = item;
            }
        }

        previousStateEntities = this.stateProcessorService.applyHistoryUntilNow(
            previousStateEntities, history, previousProcessedItem, history[history.length - 1]);
        actionsForTurn = this.fillMissingEntities(actionsForTurn, previousStateEntities);
        // Sort actions based on their index (so that actions that were created from the same 
        // parent action can have a custom order)
        actionsForTurn = this.sortActions(actionsForTurn, (a: Action, b: Action) => a.index - b.index);
        // Give an opportunity to each parser to combine the actions it produced by merging them
        // For instance, if we two card draws in a row, we might want to display them as a single 
        // action that draws two cards
        actionsForTurn = this.reduceActions(actionParsers, actionsForTurn);
        actionsForTurn = this.addDamageToEntities(actionsForTurn, previousStateEntities);
        try {
            const turnWithNewActions = game.turns.get(this.currentTurn).update({actions: actionsForTurn});
            turns = turns.set(turnWithNewActions.turn == 'mulligan' ? 0 : parseInt(turnWithNewActions.turn), turnWithNewActions);
            actionsForTurn = [];
        }
        catch (e) {
            this.logger.error(e);
            this.logger.warn(this.currentTurn, turns.toJS(), actionsForTurn);
        }


        return Game.createGame(game, { turns: turns });
    }
    
    private fillMissingEntities(
            actionsForTurn: ReadonlyArray<Action>, 
            previousStateEntities: Map<number, Entity>): ReadonlyArray<Action> {
        let newActionsForTurn = [];
        for (let i = 0; i < actionsForTurn.length; i++) {
            if (actionsForTurn[i].entities) {
                newActionsForTurn.push(actionsForTurn[i]);
            }
            else {
                newActionsForTurn.push(actionsForTurn[i].update(previousStateEntities));
            }
        }
        return newActionsForTurn;
    }

    private addDamageToEntities(
        actionsForTurn: ReadonlyArray<Action>, 
        previousStateEntities: Map<number, Entity>): ReadonlyArray<Action> {
            let newActionsForTurn = [];
            for (let i = 0; i < actionsForTurn.length; i++) {
                let newEntities = actionsForTurn[i].entities
                        ? actionsForTurn[i].entities
                        : previousStateEntities;
                let entitiesAfterDamageUpdate: Map<number, Entity> = this.isDamageAction(actionsForTurn[i])
                        ? newEntities.map((entity) => this.updateDamageForEntity(actionsForTurn[i], entity)).toMap()
                        : newEntities;
                newActionsForTurn.push(actionsForTurn[i].update(entitiesAfterDamageUpdate));
            }
            return newActionsForTurn;
    }

    private isDamageAction(action: Action): boolean {
        return 'damages' in action;
    }

    private updateDamageForEntity(damageAction: Action, entity: Entity): Entity {
        const damages: Map<number, number> = damageAction['damages'];
        const damage = damages.get(entity.id, 0);
        return damage ? entity.updateDamage(damage) : entity;
    }
    
    private updateCurrentTurn(item: HistoryItem, game: Game, actions: ReadonlyArray<Action>): Turn {
        if (actions.length > 1 
                && actions[actions.length - 1] instanceof StartTurnAction
                && !(actions[actions.length - 1] as StartTurnAction).isStartOfMulligan) {
            let turnToUpdate: Turn = game.turns.get(this.currentTurn);
            this.currentTurn++;
            return turnToUpdate;
        }
        return null;
    }
    
    private reduceActions(actionParsers: Parser[], actionsForTurn: ReadonlyArray<Action>): ReadonlyArray<Action> {
        let reducedActions = actionsForTurn;
        for (const parser of actionParsers) {
            reducedActions = parser.reduce(reducedActions);
        }
        // Because the different parsers can interact with each other, we need to apply all 
        // of them until the result doesn't change anymore
        // This looks heavy in perf, but there aren't many actions, and it lets us 
        // handle each action type independently, which makes for more separated concerns
        if (!this.areEqual(reducedActions, actionsForTurn)) {
            return this.reduceActions(actionParsers, reducedActions);
        }
        return reducedActions;
    }

    private sortActions<T>(array: ReadonlyArray<T>, sortingFunction: (a: T, b: T) => number): ReadonlyArray<T> {
        let intermediate: T[] = [...array];
        intermediate.sort(sortingFunction);
        return intermediate as ReadonlyArray<T>;
    }

    private areEqual(actions1: ReadonlyArray<Action>, actions2: ReadonlyArray<Action>): boolean {
        if (actions1.length !== actions2.length) {
            return false;
        }
        for (let i = 0; i < actions1.length; i++) {
            if (actions1[i] !== actions2[i]) {
                return false;
            }
        }
        return true;
    }
}
