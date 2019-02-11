import { Injectable } from '@angular/core';
import { Game } from '../../models/game/game';
import { NGXLogger } from 'ngx-logger';

@Injectable()
export class NarratorService {

    constructor(private logger: NGXLogger) {
    }

    public populateActionText(game: Game) {
        let turnsWithActions = game.turns;
        const numberOfTurns = turnsWithActions.size;
        for (let i = 0; i < numberOfTurns; i++) {
            // this.logger.debug('getting turn', i, game.turns.toJS());
            const turn = game.turns.get(i);
            const enrichedActions = turn.actions.map((action) => action.enrichWithText());
            const enrichedTurn = turn.update({ actions: enrichedActions });
            turnsWithActions = turnsWithActions.set(i, enrichedTurn);
        }
        return Game.createGame(game, { turns: turnsWithActions });
    }
    
	public createGameStory(game: Game): Game {
        const allActions = game.turns.toArray()
            .map((turn) => turn.actions)
            .reduce((a, b) => a.concat(b), []);
        const fullStoryRaw: string = allActions
            .map((action) => action.textRaw)
            .join('\n');
        return Game.createGame(game, { fullStoryRaw: '\n' + fullStoryRaw });;
	}
}