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
        <div class="game" [ngClass]="{'mulligan': isMulligan}">
            <div class="play-areas">
                <play-area class="top"
                        [mulligan]="isMulligan"
                        [entities]="_entities" 
                        [playerId]="_opponentId">
                </play-area>
                <play-area class="bottom" 
                        [mulligan]="isMulligan"
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
            <div class="overlays" *ngIf="isMulligan">
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
    _activeSpell: number;

    isMulligan: boolean;

    constructor(private logger: NGXLogger) { } 

    @Input('turn') set turn(value: string) {
        this._turn = value;
        // TODO: move this piece of logic out of the view
        this.isMulligan = this._turn === 'Mulligan' && !this._activeSpell;
        this.logger.debug('[game] setting turn', value, this.isMulligan);
    }

    @Input('entities') set entities(entities: Map<number, Entity>) {
        this.logger.debug('[game] setting new entities', entities.toJS());
        this._entities = entities;
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
        this._activeSpell = value;
        // TODO: move this piece of logic out of the view
        this.isMulligan = this._turn === 'Mulligan' && !this._activeSpell;
    }

}
