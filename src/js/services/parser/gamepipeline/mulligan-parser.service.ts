import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { AllCardsService } from '../../all-cards.service';
import { Game } from '../../../models/game/game';
import { Turn } from '../../../models/game/turn';
import { Action } from '../../../models/action/action';

@Injectable()
export class MulliganParserService {

    constructor(private logger: NGXLogger, private allCards: AllCardsService) {
    }

    public affectMulligan(game: Game): Game {
        let turns = game.turns;
        const numberOfTurns = turns.size;
        const mulliganTurn = game.turns.get(0);
        const enrichedMulligan = this.enrichTurn(mulliganTurn);
        turns = turns.set(0, enrichedMulligan);
        return Game.createGame(game, { turns: turns });
    }

    private enrichTurn(turn: Turn): Turn {
        const newActions = [];
        for (let i = 0; i < turn.actions.length; i++) {
            const previousAction = i == 0 ? null : newActions[i - 1];
            const newAction = this.enrichAction(turn.actions[i], previousAction);
            newActions.push(newAction);
        }
        return turn.update({ actions: newActions as ReadonlyArray<Action> } as Turn);
    }

    private enrichAction(action: Action, previousAction: Action): Action {
        let isMulligan = true;
        if (action.activeSpell) {
            isMulligan = false;
        }
        else if (previousAction) {
            isMulligan = previousAction.isMulligan;
        }
        return action.updateAction({ isMulligan: isMulligan } as Action);
    }
}