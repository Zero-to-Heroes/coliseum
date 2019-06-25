import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { AllCardsService } from '../all-cards.service';
import { Game } from '../../models/game/game';
import { Turn } from '../../models/game/turn';
import { Action } from '../../models/action/action';
import { StartTurnAction } from '../../models/action/start-turn-action';
import { CardPlayedFromHandAction } from '../../models/action/card-played-from-hand-action';
import { GameTag } from '../../models/enums/game-tags';
import { CardType } from '../../models/enums/card-type';
import { PowerTargetAction } from '../../models/action/power-target-action';

@Injectable()
export class ActiveSpellParserService {

    private readonly ACTIONS_THAT_RESET_ACTIVE_SPELL = [
        typeof StartTurnAction,
    ];

    constructor(private logger: NGXLogger, private allCards: AllCardsService) {
    }

    public parseActiveSpell(game: Game): Game {
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
            const previousAction = i == 0 ? null : turn.actions[i - 1];
            const newAction = this.enrichAction(turn.actions[i], previousAction);
            newActions.push(newAction);
        }
        return turn.update({ actions: newActions as ReadonlyArray<Action> } as Turn);
    }

    private enrichAction(action: Action, previousAction: Action): Action {
        // Don't set any active spell for these actions
        if (this.ACTIONS_THAT_RESET_ACTIVE_SPELL.indexOf(typeof action) !== -1) {
            return action;
        }

        let activeSpell = undefined;
        if (action instanceof CardPlayedFromHandAction 
                && action.entities.get(action.entityId).getTag(GameTag.CARDTYPE) === CardType.SPELL) {
            activeSpell = action.entityId;
        }
        else if (action instanceof PowerTargetAction
                && action.entities.get(action.origin).getTag(GameTag.CARDTYPE) === CardType.SPELL) {
            activeSpell = action.origin;
        }
        else {
            activeSpell = previousAction && previousAction.activeSpell;
        }
        if (activeSpell) {
            this.logger.debug('Updating active spell', activeSpell);
            return action.updateAction({ activeSpell: activeSpell } as Action);
        }
        return action;
    }
}
