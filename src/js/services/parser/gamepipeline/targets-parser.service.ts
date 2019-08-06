import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { AllCardsService } from '../../all-cards.service';
import { Game } from '../../../models/game/game';
import { Turn } from '../../../models/game/turn';
import { Action } from '../../../models/action/action';
import { HasTarget } from '../../../models/action/has-target';
import { HasTargets } from '../../../models/action/has-targets';

@Injectable()
export class TargetsParserService {
	constructor(private logger: NGXLogger, private allCards: AllCardsService) {}

	public parseTargets(game: Game): Game {
		let turns = game.turns;
		const numberOfTurns = turns.size;
		for (let i = 0; i < numberOfTurns; i++) {
			const turn = game.turns.get(i);
			const enrichedTurn = this.enrichTurn(turn);
			turns = turns.set(i, enrichedTurn);
		}
		return Game.createGame(game, { turns: turns });
	}

	private enrichTurn(turn: Turn): Turn {
		const newActions = [];
		for (let i = 0; i < turn.actions.length; i++) {
			const previousAction = i === 0 ? null : newActions[i - 1];
			const newAction = this.enrichAction(turn.actions[i], previousAction);
			newActions.push(newAction);
		}
		return turn.update({ actions: newActions as readonly Action[] } as Turn);
	}

	private enrichAction(action: Action, previousAction: Action): Action {
		if (this.hasTarget(action)) {
			const targetPair: readonly [number, number][] = [[action.originId, action.targetId]];
			return action.updateAction({ targets: targetPair } as Action);
		} else if (this.hasTargets(action)) {
			const targetPairs = action.targetIds.map(targetId => [action.originId, targetId] as [number, number]) as readonly [
				number,
				number,
			][];
			return action.updateAction({ targets: targetPairs } as Action);
		}
		return action;
	}

	private hasTarget(action: any): action is HasTarget {
		return 'originId' in action && 'targetId' in action && action['originId'] && action['targetId'];
	}

	private hasTargets(action: any): action is HasTargets {
		return 'originId' in action && 'targetIds' in action && action['originId'] && action['targetIds'];
	}
}
