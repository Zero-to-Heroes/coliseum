import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Map } from 'immutable';
import { Entity } from '../../models/game/entity';
import { NGXLogger } from 'ngx-logger';
import { GameTag } from '../../models/enums/game-tags';
import { PlayState } from '../../models/enums/playstate';

@Component({
	selector: 'game',
	styleUrls: [
        '../../../css/components/game/game.component.scss'
    ],
	template: `
        <div class="game" [ngClass]="{'in-overlay': isOverlay}">
            <div class="play-areas">
                <play-area class="top"
                        [mulligan]="_isMulligan"
                        [entities]="_entities" 
                        [options]="_options"
                        [playerId]="_opponentId">
                </play-area>
                <play-area class="bottom" 
                        [mulligan]="_isMulligan"
                        [entities]="_entities" 
                        [options]="_options"
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
                    [entity]="_activeSpell"
                    [controller]="_activeSpellController">
            </active-spell>
            <target-zone *ngIf="_targets" [targets]="_targets"></target-zone>
            <div class="overlays" *ngIf="isOverlay">
                <mulligan *ngIf="_isMulligan" class="top"
                        [entities]="_entities" 
                        [crossed]="_crossed"
                        [playerId]="_opponentId">
                </mulligan>
                <mulligan *ngIf="_isMulligan" class="bottom"
                        [entities]="_entities" 
                        [crossed]="_crossed"
                        [playerId]="_playerId">
                </mulligan>
                <end-game *ngIf="_isEndGame" 
                        [status]="_endGameStatus" 
                        [entities]="_entities" 
                        [playerId]="_playerId">
                </end-game>
                <discover *ngIf="_discovers" 
                        [entities]="_entities" 
                        [choices]="_discovers">
                </discover>
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
    _activeSpellController: Entity;  
    _targets: ReadonlyArray<[number, number]> = [];
    _options: ReadonlyArray<number> = [];
    
    isOverlay: boolean;
    _discovers: ReadonlyArray<number>;
    _isMulligan: boolean;
    _isEndGame: boolean;
    _endGameStatus: PlayState;

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

    @Input('discovers') set discovers(value: ReadonlyArray<number>) {
        this.logger.debug('[game] setting discovers', value);
        this._discovers = value;
        this.updateOverlay();
    }

    @Input('isMulligan') set isMulligan(value: boolean) {
        this.logger.debug('[game] setting isMulligan', value);
        this._isMulligan = value;
        this.updateOverlay();
    }

    @Input('isEndGame') set isEndGame(value: boolean) {
        this.logger.debug('[game] setting isEndGame', value);
        this._isEndGame = value;
        this.updateOverlay();
    }

    @Input('endGameStatus') set endGameStatus(value: PlayState) {
        this.logger.debug('[game] setting endGameStatus', value);
        this._endGameStatus = value;
        this.updateOverlay();
    }

    @Input('targets') set targets(value: ReadonlyArray<[number, number]>) {
        this.logger.debug('[game] setting targets', value);
        this._targets = value;
    }

    @Input('options') set options(value: ReadonlyArray<number>) {
        this.logger.debug('[game] setting options', value);
        this._options = value;
    }

    private updateOverlay() {
        this.isOverlay = this._isMulligan 
                || this._isEndGame 
                || (this._discovers && this._discovers.length > 0);
    }

    private updateActiveSpell() {
        this._activeSpell = this._entities && this.activeSpellId && this._entities.get(this.activeSpellId);
        this._activeSpellController = this._entities.find((entity) => entity.getTag(GameTag.PLAYER_ID) === this._playerId);
    }
}
