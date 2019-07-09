import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { AllCardsService } from '../../all-cards.service';
import { Game } from '../../../models/game/game';
import { Turn } from '../../../models/game/turn';
import { Action } from '../../../models/action/action';
import { StartTurnAction } from '../../../models/action/start-turn-action';
import { CardPlayedFromHandAction } from '../../../models/action/card-played-from-hand-action';
import { GameTag } from '../../../models/enums/game-tags';
import { CardType } from '../../../models/enums/card-type';
import { PowerTargetAction } from '../../../models/action/power-target-action';
import { AttachingEnchantmentAction } from '../../../models/action/attaching-enchantment-action';
import { DamageAction } from '../../../models/action/damage-action';
import { CardTargetAction } from '../../../models/action/card-target-action';
import { SummonAction } from '../../../models/action/summon-action';
import { CardDrawAction } from '../../../models/action/card-draw-action';
import { HealingAction } from '../../../models/action/healing-action';

@Injectable()
export class ActivePlayerParserService {

    constructor(private logger: NGXLogger, private allCards: AllCardsService) {
    }

    public parseActivePlayer(game: Game): Game {
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
            const previousAction = i == 0 ? null : newActions[i - 1];
            const newAction = this.enrichAction(turn.actions[i], previousAction);
            newActions.push(newAction);
        }
        return turn.update({ actions: newActions as ReadonlyArray<Action> } as Turn);
    }

    private enrichAction(action: Action, previousAction: Action): Action {
        if (action.activePlayer) {
            return action;
        }
        else if (previousAction && previousAction.activePlayer) {
            return action.updateAction({ activePlayer: previousAction.activePlayer } as Action);
        }
        else {
            return action;
        }
    }
}