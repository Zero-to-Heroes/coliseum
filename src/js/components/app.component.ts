import { Component, ChangeDetectionStrategy, NgZone, ChangeDetectorRef, HostListener, ViewRef } from '@angular/core';

import { Map } from 'immutable';
import { Key } from 'ts-keycode-enum';
import { Entity } from '../models/game/entity';
import { Game } from '../models/game/game';
import { GameParserService } from '../services/parser/game-parser.service';
import { Events } from '../services/events.service';
import { NGXLogger } from 'ngx-logger';
import { GameTag } from '../models/enums/game-tags';
import { PlayerEntity } from '../models/game/player-entity';
import { PlayState } from '../models/enums/playstate';
import { DiscoverAction } from '../models/action/discover-action';
import { SecretRevealedAction } from '../models/action/secret-revealed-action';
import { CardBurnAction } from '../models/action/card-burn-action';
import { FatigueDamageAction } from '../models/action/fatigue-damage-action';

@Component({
	styleUrls: [
		'../../css/components/app.component.scss'
	],
	template: `
		<div class="coliseum wide">
            <game *ngIf="game"
                    [turn]="turnString"
                    [playerId]="game.players[0].playerId" 
                    [opponentId]="game.players[1].playerId"
                    [playerName]="game.players[0].name"
                    [opponentName]="game.players[1].name"
                    [activePlayer]="activePlayer"
                    [activeSpell]="activeSpell"
                    [isMulligan]="isMulligan"
                    [isEndGame]="isEndGame"
                    [endGameStatus]="endGameStatus"
                    [entities]="entities"
                    [targets]="targets"
                    [secretRevealed]="secretRevealed"
                    [discovers]="discovers"
                    [burned]="burned"
                    [fatigue]="fatigue"
                    [chosen]="chosen"
                    [options]="options"
                    [crossed]="crossed">
            </game>
			<turn-narrator [text]="text"></turn-narrator>
			<tooltips></tooltips>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
    
    reviewId: string;

	game: Game;
    entities: Map<number, Entity>;
    crossed: ReadonlyArray<number>;
    text: string;
    turnString: string;
    activePlayer: number;
    activeSpell: number;
    discovers: ReadonlyArray<number>;
    chosen: ReadonlyArray<number>;
    burned: ReadonlyArray<number>;
    fatigue: number;
    targets: ReadonlyArray<[number, number]>;
    options: ReadonlyArray<number>;
    secretRevealed: number;
    
    isMulligan: boolean;
    isEndGame: boolean;
    endGameStatus: PlayState;

	private currentActionInTurn: number = 0;
	private currentTurn: number = 0;

	constructor(
			private gameParser: GameParserService,
			private events: Events,
			private cdr: ChangeDetectorRef,
            private logger: NGXLogger,
			private zone: NgZone) {
		window['coliseum'] = {
			zone: this.zone,
			component: this
		};
    }

	public loadReplay(replayXml: string) {
		this.game = this.gameParser.parse(replayXml);
        this.logger.info('[app] Converted game');
        const turn = parseInt(this.getSearchParam('turn')) || 0; 
        const action = parseInt(this.getSearchParam('action')) || 0;
        this.reviewId = this.getSearchParam('reviewId');
        this.currentTurn = turn <= 0
                ? 0
                : (turn >= this.game.turns.size
                        ? this.game.turns.size - 1
                        : turn);
        this.currentActionInTurn = action <= 0
                ? 0
                : (action >= this.game.turns.get(this.currentTurn).actions.length
                        ? this.game.turns.get(this.currentTurn).actions.length - 1
                        : action);
        this.populateInfo();
    }

	@HostListener('document:keyup', ['$event'])
	onKeyPressHandler(event: KeyboardEvent) {
		switch (event.which) {
			case Key.RightArrow:
				this.moveCursorToNextAction();
				break;
			case Key.LeftArrow:
				this.moveCursorToPreviousAction();
				break;
            case Key.UpArrow:
                this.moveCursorToNextTurn();
                break;
            case Key.DownArrow:
                this.moveCursorToPreviousTurn();
                break;
		}
        this.populateInfo();
    }
    
    private populateInfo() {
        if (!this.game) {
            return;
        }
        this.entities = this.computeNewEntities();
        this.crossed = this.computeCrossed();
		this.text = this.computeText();
        this.turnString = this.computeTurnString();
        this.activePlayer = this.computeActivePlayer();
        this.activeSpell = this.computeActiveSpell();
        this.secretRevealed = this.computeSecretRevealed();
        this.targets = this.computeTargets();
        this.options = this.computeOptions();
        this.discovers = this.computeDiscovers();
        this.chosen = this.computeChosen();
        this.burned = this.computeBurned();
        this.fatigue = this.computeFatigue();
        this.isMulligan = this.computeMulligan();
        this.isEndGame = this.computeEndGame();
        this.endGameStatus = this.computeEndGameStatus();
        this.updateUrlQueryString();
        this.logger.debug('[app] setting turn', this.turnString);
        this.logger.info('[app] Considering action', this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn]);
        if (!(<ViewRef>this.cdr).destroyed) {
            this.cdr.detectChanges();
        }
    }

	private computeActiveSpell(): number {
		return this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn].activeSpell;
	}

	private computeMulligan(): boolean {
		return this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn].isMulligan;
	}

	private computeEndGame(): boolean {
		return this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn].isEndGame;
	}

	private computeEndGameStatus(): PlayState {
		return this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn].endGameStatus;
	}

	private computeOptions(): ReadonlyArray<number> {
		return this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn].options;
	}

	private computeBurned(): ReadonlyArray<number> {
        const action = this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn];
        if (action instanceof CardBurnAction) {
            return action.burnedCardIds;
        }
        return null;
	}

	private computeDiscovers(): ReadonlyArray<number> {
        const action = this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn];
        if (action instanceof DiscoverAction) {
            return action.choices;
        }
        return null;
	}

	private computeChosen(): ReadonlyArray<number> {
        const action = this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn];
        if (action instanceof DiscoverAction) {
            return action.chosen;
        }
        return null;
	}

	private computeFatigue(): number {
        const action = this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn];
        if (action instanceof FatigueDamageAction) {
            return action.amount;
        }
        return null;
	}

	private computeSecretRevealed(): number {
        const action = this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn];
        if (action instanceof SecretRevealedAction) {
            return action.entityId;
        }
        return null;
	}

    private computeActivePlayer(): number {
        return this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn].activePlayer;
    }

	private computeNewEntities(): Map<number, Entity> {
		return this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn].entities;
	}

	private computeCrossed(): ReadonlyArray<number> {
		return this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn].crossedEntities;
	}

	private computeText(): string {
		return this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn].textRaw;
    }
    
	private computeTurnString(): string {
        return this.game.turns.get(this.currentTurn).turn === 'mulligan'
                ? 'Mulligan'
                : `Turn${this.game.turns.get(this.currentTurn).turn}`
	}

	private computeTargets(): ReadonlyArray<[number, number]> {
		return this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn].targets;
	}

	private moveCursorToNextAction() {
        if (this.currentActionInTurn >= this.game.turns.get(this.currentTurn).actions.length - 1
                && this.currentTurn >= this.game.turns.size - 1) {
            return;
        }
		this.currentActionInTurn++;
		if (this.currentActionInTurn >= this.game.turns.get(this.currentTurn).actions.length) {
			this.currentActionInTurn = 0;
			this.currentTurn++;
		}
	}

	private moveCursorToPreviousAction() {
        if (this.currentActionInTurn === 0 && this.currentTurn === 0) {
            return;
        }
		this.currentActionInTurn--;
		if (this.currentActionInTurn < 0) {
			this.currentTurn--;
			this.currentActionInTurn = this.game.turns.get(this.currentTurn).actions.length - 1;
		}
	}

	private moveCursorToNextTurn() {
        if (this.currentTurn >= this.game.turns.size - 1) {
            return;
        }
        this.currentActionInTurn = 0;
        this.currentTurn++;
	}

	private moveCursorToPreviousTurn() {
        if (this.currentTurn === 0) {
            return;
        }
        this.currentActionInTurn = 0;
        this.currentTurn--;
        
	}
    
    private getSearchParam(name: string): string {
        const searchString = window.location.search.substring(1);
        const searchParams = searchString.split('&');
        return searchParams
                .filter(param => param.indexOf('=') !== -1)
                .filter(param => param.split('=')[0] === name)
                .map(param => param.split('=')[1])
                [0];
    }

    private updateUrlQueryString() {
        const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
        const reviewQuery = this.reviewId ? `reviewId=${this.reviewId}&` : '';
        const queryString = `${reviewQuery}turn=${this.currentTurn}&action=${this.currentActionInTurn}`
        const newUrl = `${baseUrl}?${queryString}`;
        window.history.replaceState({ path: newUrl }, '', newUrl);
    }
}
