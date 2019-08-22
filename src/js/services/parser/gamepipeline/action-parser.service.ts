import { Injectable } from '@angular/core';
import { Map } from 'immutable';
import { NGXLogger } from 'ngx-logger';
import { Action } from '../../../models/action/action';
import { StartTurnAction } from '../../../models/action/start-turn-action';
import { Entity } from '../../../models/game/entity';
import { Game } from '../../../models/game/game';
import { Turn } from '../../../models/game/turn';
import { HistoryItem } from '../../../models/history/history-item';
import { AllCardsService } from '../../all-cards.service';
import { AttachingEnchantmentParser } from '../action/attaching-enchantment-parser';
import { AttackParser } from '../action/attack-parser';
import { CardBurnParser } from '../action/card-burn-parser';
import { CardDiscardParser } from '../action/card-discard-parser';
import { CardDrawParser } from '../action/card-draw-parser';
import { CardPlayedFromHandParser } from '../action/card-played-from-hand-parser';
import { CardTargetParser } from '../action/card-target-parser';
import { DamageParser } from '../action/damage-parser';
import { DiscoverParser } from '../action/discover-parser';
import { DiscoveryPickParser } from '../action/discovery-pick-parser';
import { EndGameParser } from '../action/end-game-parser';
import { FatigueDamageParser } from '../action/fatigue-damage-parser';
import { HeroPowerUsedParser } from '../action/hero-power-used-parser';
import { MinionDeathParser } from '../action/minion-death-parser';
import { MulliganCardChoiceParser } from '../action/mulligan-card-choice-parser';
import { MulliganCardParser } from '../action/mulligan-card-parser';
import { OptionsParser } from '../action/options-parser';
import { Parser } from '../action/parser';
import { PowerTargetParser } from '../action/power-target-parser';
import { QuestCompletedParser } from '../action/quest-completed-parser';
import { SecretPlayedFromHandParser } from '../action/secret-played-from-hand-parser';
import { SecretRevealedParser } from '../action/secret-revealed-parser';
import { StartOfMulliganParser } from '../action/start-of-mulligan-parser';
import { StartTurnParser } from '../action/start-turn-parser';
import { SummonsParser } from '../action/summons-parser';
import { StateProcessorService } from '../state-processor.service';

@Injectable()
export class ActionParserService {
	private currentTurn = 0;
	private hasYielded = false;

	constructor(private logger: NGXLogger, private allCards: AllCardsService, private stateProcessorService: StateProcessorService) {}

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
			new QuestCompletedParser(this.allCards, this.logger),
		];
	}

	public *parseActions(game: Game, history: readonly HistoryItem[]): IterableIterator<Game> {
		// const start = Date.now();
		this.currentTurn = 0;
		let actionsForTurn: readonly Action[] = [];
		let previousStateEntities: Map<number, Entity> = game.entities;
		let previousProcessedItem: HistoryItem = history[0];
		let turns: Map<number, Turn> = Map<number, Turn>();
		// Recreating this every time lets the parsers store state and emit the action only when necessary
		const actionParsers: Parser[] = this.registerActionParsers();

		// let parserDurationForTurn = 0;
		for (const item of history) {
			// const start = Date.now();
			actionParsers.forEach(parser => {
				if (parser.applies(item)) {
					// const start = Date.now();
					// When we perform an action, we want to show the result of the state updates until the next action is
					// played.
					previousStateEntities = this.stateProcessorService.applyHistoryUntilNow(
						previousStateEntities,
						history,
						previousProcessedItem,
						item,
					);
					const actions: Action[] = parser.parse(item, this.currentTurn, previousStateEntities, history, game.players);
					if (actions && actions.length > 0) {
						actionsForTurn = this.fillMissingEntities(actionsForTurn, previousStateEntities);
						actionsForTurn = [...actionsForTurn, ...actions];
						previousProcessedItem = item;
					}
					// const time = Date.now() - start;
					// if (time > 2) {
					// 	this.logger.log('took', time, 'ms to apply parser', parser);
					// }
				}
			});
			// parserDurationForTurn += Date.now() - start;

			const updatedTurn: Turn = this.updateCurrentTurn(item, game, actionsForTurn);
			// This whole process takes roughly 5-20ms depending on the turn
			if (updatedTurn) {
				// this.logger.log('took', parserDurationForTurn, 'ms to parse all history items in turn');
				// parserDurationForTurn = 0;
				// const start = Date.now();
				// The last action is a start turn action, which we want to keep for the start
				// of the next turn instead
				const lastAction = actionsForTurn[actionsForTurn.length - 1];
				actionsForTurn = actionsForTurn.slice(0, actionsForTurn.length - 1);
				previousStateEntities = this.stateProcessorService.applyHistoryUntilNow(
					previousStateEntities,
					history,
					previousProcessedItem,
					item,
				);
				actionsForTurn = this.fillMissingEntities(actionsForTurn, previousStateEntities);
				// Sort actions based on their index (so that actions that were created from the same
				// parent action can have a custom order)
				actionsForTurn = this.sortActions(actionsForTurn, (a: Action, b: Action) => a.index - b.index);
				// Give an opportunity to each parser to combine the actions it produced by merging them
				// For instance, if we two card draws in a row, we might want to display them as a single
				// action that draws two cards
				actionsForTurn = this.reduceActions(actionParsers, actionsForTurn);
				actionsForTurn = this.addDamageToEntities(actionsForTurn, previousStateEntities);
				const turnWithNewActions = updatedTurn.update({ actions: actionsForTurn });
				const turnNumber = turnWithNewActions.turn === 'mulligan' ? 0 : parseInt(turnWithNewActions.turn);
				turns = turns.set(turnNumber, turnWithNewActions);
				actionsForTurn = [lastAction];
				previousProcessedItem = item;
				yield Game.createGame(game, { turns: turns });
				// if (this.shouldYield()) {
				// 	// Return something as soon as we can show something on screen, i.e the first turn
				// 	// this.logger.log('took', Date.now() - start, 'ms to merge everything after turn', turnNumber);
				// }
			}
		}

		previousStateEntities = this.stateProcessorService.applyHistoryUntilNow(
			previousStateEntities,
			history,
			previousProcessedItem,
			history[history.length - 1],
		);
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
			const turnWithNewActions = game.turns.get(this.currentTurn).update({ actions: actionsForTurn });
			turns = turns.set(turnWithNewActions.turn === 'mulligan' ? 0 : parseInt(turnWithNewActions.turn), turnWithNewActions);
			actionsForTurn = [];
		} catch (e) {
			this.logger.error(e);
			this.logger.warn(this.currentTurn, turns.toJS(), actionsForTurn);
		}
		// this.logger.log('took', Date.now() - start, 'ms for parseActions');
		yield Game.createGame(game, { turns: turns });
	}

	private fillMissingEntities(actionsForTurn: readonly Action[], previousStateEntities: Map<number, Entity>): readonly Action[] {
		const newActionsForTurn = [];
		for (let i = 0; i < actionsForTurn.length; i++) {
			if (actionsForTurn[i].entities) {
				newActionsForTurn.push(actionsForTurn[i]);
			} else {
				newActionsForTurn.push(actionsForTurn[i].update(previousStateEntities));
			}
		}
		return newActionsForTurn;
	}

	private addDamageToEntities(actionsForTurn: readonly Action[], previousStateEntities: Map<number, Entity>): readonly Action[] {
		const newActionsForTurn = [];
		for (let i = 0; i < actionsForTurn.length; i++) {
			const newEntities = actionsForTurn[i].entities ? actionsForTurn[i].entities : previousStateEntities;
			const entitiesAfterDamageUpdate: Map<number, Entity> = this.isDamageAction(actionsForTurn[i])
				? newEntities.map(entity => this.updateDamageForEntity(actionsForTurn[i], entity)).toMap()
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

	private updateCurrentTurn(item: HistoryItem, game: Game, actions: readonly Action[]): Turn {
		if (
			actions.length > 1 &&
			actions[actions.length - 1] instanceof StartTurnAction &&
			!(actions[actions.length - 1] as StartTurnAction).isStartOfMulligan
		) {
			const turnToUpdate: Turn = game.turns.get(this.currentTurn);
			this.currentTurn++;
			return turnToUpdate;
		}
		return null;
	}

	private reduceActions(actionParsers: Parser[], actionsForTurn: readonly Action[]): readonly Action[] {
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

	private sortActions<T>(array: readonly T[], sortingFunction: (a: T, b: T) => number): readonly T[] {
		const intermediate: T[] = [...array];
		intermediate.sort(sortingFunction);
		return intermediate as readonly T[];
	}

	private areEqual(actions1: readonly Action[], actions2: readonly Action[]): boolean {
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

	private shouldYield() {
		if (!this.hasYielded) {
			this.hasYielded = true;
			return true;
		}
		return false;
	}
}
