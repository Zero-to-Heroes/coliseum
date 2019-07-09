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
            const previousAction = i == 0 ? null : newActions[i - 1];
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

        // By default, don't show any active spell
        let activeSpell = undefined;
        if (action instanceof CardPlayedFromHandAction 
                && action.entities.get(action.entityId).getTag(GameTag.CARDTYPE) === CardType.SPELL) {
            activeSpell = action.entityId;
        }
        else if (action instanceof PowerTargetAction
                && action.entities.get(action.originId).getTag(GameTag.CARDTYPE) === CardType.SPELL) {
            activeSpell = action.originId;
        }
        else if (action instanceof AttachingEnchantmentAction
                && action.entities.get(action.originId).getTag(GameTag.CARDTYPE) === CardType.SPELL) {
            activeSpell = action.originId;
        }
        else if (action instanceof CardTargetAction
                && action.entities.get(action.originId).getTag(GameTag.CARDTYPE) === CardType.SPELL) {
            activeSpell = action.originId;
        }
        else if (action instanceof SummonAction
                && action.entities.get(action.origin).getTag(GameTag.CARDTYPE) === CardType.SPELL) {
            activeSpell = action.origin;
        }
        // If there is alraedy an active spell, attaching an enchantment is probably linked to that spell
        else if (action instanceof AttachingEnchantmentAction && previousAction && previousAction.activeSpell) {
            activeSpell = previousAction.activeSpell;
        }
        // Similarly if we draw a card
        else if (action instanceof CardDrawAction && previousAction && previousAction.activeSpell) {
            activeSpell = previousAction.activeSpell;
        }
        // Similarly if damage is dealth
        else if (action instanceof DamageAction && previousAction && previousAction.activeSpell) {
            activeSpell = previousAction.activeSpell;
        }
        
        if (activeSpell) {
            // this.logger.debug('Updating active spell', activeSpell);
            return action.updateAction({ activeSpell: activeSpell } as Action);
        }
        return action;
    }
}
