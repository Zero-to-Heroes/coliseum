import { Component, ChangeDetectionStrategy, Input, AfterViewInit, ChangeDetectorRef, ViewRef } from '@angular/core';
import { Map } from 'immutable';
import { Entity } from '../../models/game/entity';
import { NGXLogger } from 'ngx-logger';
import { GameTag } from '../../models/enums/game-tags';
import { PlayState } from '../../models/enums/playstate';
import { Events } from '../../services/events.service';

@Component({
	selector: 'game',
	styleUrls: [
        '../../../css/components/game/game.component.scss'
    ],
	template: `
        <div class="game" 
                [ngClass]="{ 'in-overlay': isOverlay, 'mulligan': _isMulligan, 'quest': _quest }">
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
            <secret-revealed class="secret-revealed"
                    *ngIf="_secretRevealed"
                    [entity]="_secretRevealed">
            </secret-revealed>
            <quest-tooltip *ngIf="_quest" [quest]="_quest"></quest-tooltip>
            <target-zone *ngIf="_targets" 
                    [targets]="_targets" 
                    [active]="_playerId === _activePlayer">
            </target-zone>
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
                        [choices]="_discovers"
                        [chosen]="_chosen">
                </discover>
                <burn *ngIf="_burned" 
                        [entities]="_entities" 
                        [burned]="_burned">
                </burn>
                <fatigue *ngIf="_fatigue" [fatigue]="_fatigue"></fatigue>
            </div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent implements AfterViewInit {

    _turn: string;
    _entities: Map<number, Entity>;
    _crossed: ReadonlyArray<number> = [];
    _playerId: number;
    _opponentId: number;
    _playerName: string;
    _opponentName: string;
    _activePlayer: number;
    _secretRevealed: Entity;
    _activeSpell: Entity;  
    _activeSpellController: Entity;  
    _targets: ReadonlyArray<[number, number]> = [];
    _options: ReadonlyArray<number> = [];
    
    _quest: Entity;
    isOverlay: boolean;
    _fatigue: number;
    _discovers: ReadonlyArray<number>;
    _burned: ReadonlyArray<number>;
    _chosen: ReadonlyArray<number>;
    _isMulligan: boolean;
    _isEndGame: boolean;
    _endGameStatus: PlayState;

    private activeSpellId: number;
    private secretRevealedId: number;

    constructor(private logger: NGXLogger, private events: Events, private cdr: ChangeDetectorRef) { } 

    ngAfterViewInit() {
        this.events.on(Events.SHOW_QUEST_TOOLTIP).subscribe(data => {
            this._quest = data.data[0];
            if (!(<ViewRef>this.cdr).destroyed) {
                this.cdr.detectChanges();
            }
        });
        this.events.on(Events.HIDE_QUEST_TOOLTIP).subscribe(data => {
            this._quest = undefined;
            if (!(<ViewRef>this.cdr).destroyed) {
                this.cdr.detectChanges();
            }
        })
    }

    @Input('turn') set turn(value: string) {
        this.logger.debug('[game] setting turn', value);
        this._turn = value;
    }

    @Input('entities') set entities(entities: Map<number, Entity>) {
        this.logger.debug('[game] setting new entities', entities.toJS());
        this._entities = entities;
        this.updateActiveSpell();
        this.updateSecretRevealed();
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

    @Input('secretRevealed') set secretRevealed(value: number) {
        this.logger.debug('[game] setting secretRevealed', value);
        this.secretRevealedId = value;
        this.updateSecretRevealed();
    }

    @Input('discovers') set discovers(value: ReadonlyArray<number>) {
        this.logger.debug('[game] setting discovers', value);
        this._discovers = value;
        this.updateOverlay();
    }

    @Input('burned') set burned(value: ReadonlyArray<number>) {
        this.logger.debug('[game] setting burned', value);
        this._burned = value;
        this.updateOverlay();
    }

    @Input('fatigue') set fatigue(value: number) {
        this.logger.debug('[game] setting fatigue', value);
        this._fatigue = value;
        this.updateOverlay();
    }

    @Input('chosen') set chosen(value: ReadonlyArray<number>) {
        this.logger.debug('[game] setting chosen', value);
        this._chosen = value;
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
                || (this._discovers && this._discovers.length > 0)
                || (this._burned && this._burned.length > 0)
                || this._fatigue > 0;
    }

    private updateActiveSpell() {
        this._activeSpell = this._entities && this.activeSpellId && this._entities.get(this.activeSpellId);
        this._activeSpellController = this._entities.find((entity) => entity.getTag(GameTag.PLAYER_ID) === this._playerId);
    }

    private updateSecretRevealed() {
        this._secretRevealed = this._entities && this.secretRevealedId && this._entities.get(this.secretRevealedId);
    }
}
