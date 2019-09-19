import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Action } from '../../../models/action/action';
import { GameTag } from '../../../models/enums/game-tags';
import { Step } from '../../../models/enums/step';
import { Game } from '../../../models/game/game';
import { Turn } from '../../../models/game/turn';
import { AllCardsService } from '../../all-cards.service';

@Injectable()
export class MulliganParserService {
	constructor(private logger: NGXLogger, private allCards: AllCardsService) {}

	public affectMulligan(game: Game): Game {
		let turns = game.turns;
		const mulliganTurn = game.turns.get(0);
		const enrichedMulligan = this.enrichTurn(mulliganTurn);
		turns = turns.set(0, enrichedMulligan);
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
		let isMulligan = true;
		if (action.activeSpell) {
			isMulligan = false;
		} else if (previousAction && previousAction.entities.get(1).getTag(GameTag.STEP) === Step.BEGIN_MULLIGAN) {
			isMulligan = previousAction.isMulligan;
		}
		return action.updateAction({ isMulligan: isMulligan } as Action);
	}
}
