import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Map } from 'immutable';
import { Entity } from '../../models/game/entity';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'game',
	styleUrls: [
        '../../../css/components/game/game.component.scss'
    ],
	template: `
        <div class="game" [ngClass]="{'mulligan': _isMulligan}">
            <div class="play-areas">
                <play-area class="top"
                        [mulligan]="_isMulligan"
                        [entities]="_entities" 
                        [playerId]="_opponentId">
                </play-area>
                <play-area class="bottom" 
                        [mulligan]="_isMulligan"
                        [entities]="_entities" 
                        [playerId]="_playerId">
                </play-area>
            </div>
            <player-name class="player-name top" 
                    [name]="_opponentName"
                    [active]="_opponentId === _activePlayer">
            </player-name>
            <player-name class="player-name bottom" 
                    [name]="_playerName"
                    [active]="_playerId === _activePlayer">
            </player-name>
            <active-spell class="active-spell"
                    *ngIf="_activeSpell"
                    [entity]="_activeSpell">
            </active-spell>
            <div class="overlays" *ngIf="_isMulligan">
                <mulligan class="top"
                        [entities]="_entities" 
                        [crossed]="_crossed"
                        [playerId]="_opponentId">
                </mulligan>
                <mulligan class="bottom"
                        [entities]="_entities" 
                        [crossed]="_crossed"
                        [playerId]="_playerId">
                </mulligan>
            </div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent {

    _turn: string;
    _entities: Map<number, Entity>;
    _crossed: ReadonlyArray<number> = [];
    _playerId: number;
    _opponentId: number;
    _playerName: string;
    _opponentName: string;
    _activePlayer: number;
    _activeSpell: Entity;    
    _isMulligan: boolean;

    private activeSpellId: number;

    constructor(private logger: NGXLogger) { } 

    @Input('turn') set turn(value: string) {
        this.logger.debug('[game] setting turn', value);
        this._turn = value;
    }

    @Input('entities') set entities(entities: Map<number, Entity>) {
        this.logger.debug('[game] setting new entities', entities.toJS());
        this._entities = entities;
        this.updateActiveSpell();
    }

    @Input('crossed') set crossed(value: ReadonlyArray<number>) {
        this._crossed = value;
    }

    @Input('playerId') set playerId(playerId: number) {
        this.logger.debug('[game] setting playerId', playerId);
        this._playerId = playerId;
    }

    @Input('opponentId') set opponentId(opponentId: number) {
        this.logger.debug('[game] setting opponentId', opponentId);
        this._opponentId = opponentId;
    }

    @Input('playerName') set playerName(value: string) {
        this.logger.debug('[game] setting playerName', value);
        this._playerName = value;
    }

    @Input('opponentName') set opponentName(value: string) {
        this.logger.debug('[game] setting opponentName', value);
        this._opponentName = value;
    }

    @Input('activePlayer') set activePlayer(value: number) {
        this.logger.debug('[game] setting activePlayer', value);
        this._activePlayer = value;
    }

    @Input('activeSpell') set activeSpell(value: number) {
        this.logger.debug('[game] setting activeSpell', value);
        this.activeSpellId = value;
        this.updateActiveSpell();
    }

    @Input('isMulligan') set isMulligan(value: boolean) {
        this.logger.debug('[game] setting isMulligan', value);
        this._isMulligan = value;
    }

    private updateActiveSpell() {
        this._activeSpell = this._entities && this.activeSpellId && this._entities.get(this.activeSpellId);
    }
}
