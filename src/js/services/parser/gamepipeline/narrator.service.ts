import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Game } from '../../../models/game/game';
import { Turn } from '../../../models/game/turn';

@Injectable()
export class NarratorService {
	constructor(private logger: NGXLogger) {}

	public populateActionText(game: Game) {
		let turnsWithActions = game.turns;
		const numberOfTurns = turnsWithActions.size;
		for (let i = 0; i < numberOfTurns; i++) {
			// this.logger.debug('getting turn', i, game.turns.toJS());
			const turn = game.turns.get(i);
			const enrichedActions = turn.actions.map(action => {
				try {
					return action.enrichWithText();
				} catch (e) {
					this.logger.error('Could not enrich action with text', e, action);
					return action;
				}
			});
			const enrichedTurn = turn.update({ actions: enrichedActions });
			turnsWithActions = turnsWithActions.set(i, enrichedTurn);
		}
		return Game.createGame(game, { turns: turnsWithActions });
	}

	public createGameStory(game: Game): Game {
		const allActions = game.turns
			.toArray()
			.sort((a: Turn, b: Turn) => a.index - b.index)
			.map(turn => turn.actions)
			.reduce((a, b) => a.concat(b), []);
		const fullStoryRaw: string = allActions.map(action => action.textRaw).join('\n');
		this.logger.debug('[narrator] full story', fullStoryRaw);
		return Game.createGame(game, { fullStoryRaw: '\n' + fullStoryRaw });
	}
}
