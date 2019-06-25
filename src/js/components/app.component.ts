import { Component, ChangeDetectionStrategy, NgZone, ChangeDetectorRef, HostListener, AfterViewInit, ViewRef } from '@angular/core';
import { Map } from 'immutable';
import { Key } from 'ts-keycode-enum';
import { Entity } from '../models/game/entity';
import { Game } from '../models/game/game';
import { GameParserService } from '../services/parser/game-parser.service';
import { Events } from '../services/events.service';
import { NGXLogger } from 'ngx-logger';
import { GameTag } from '../models/enums/game-tags';
import { PlayerEntity } from '../models/game/player-entity';

@Component({
	selector: 'app-root',
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
                    [entities]="entities"
                    [crossed]="crossed">
            </game>
			<turn-narrator [text]="text"></turn-narrator>
			<tooltips></tooltips>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {

	game: Game;
    entities: Map<number, Entity>;
    crossed: ReadonlyArray<number>;
    text: string;
    turnString: string;
    activePlayer: number;
    activeSpell: number;

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
		this.cdr.detach();
	}

	public loadReplay(replayXml: Node) {
		this.game = this.gameParser.parse(replayXml);
        this.logger.info('[app] Converted game');
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
		}
        this.populateInfo();
    }
    
    private populateInfo() {
        this.entities = this.computeNewEntities();
        this.crossed = this.computeCrossed();
		this.text = this.computeText();
        this.turnString = this.computeTurnString();
        this.activePlayer = this.computeActivePlayer();
        this.activeSpell = this.computeActiveSpell();
        this.logger.debug('[app] setting turn', this.turnString);
        this.logger.debug('[app] Considering action', this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn]);
        if (!(<ViewRef>this.cdr).destroyed) {
            this.cdr.detectChanges();
        }
    }

	private computeActiveSpell(): number {
		return this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn].activeSpell;
	}

    private computeActivePlayer(): number {
        return this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn].entities
                .filter(entity => entity.getTag(GameTag.CURRENT_PLAYER) === 1)
                .map(entity => entity as PlayerEntity)
                .first()
                .playerId;
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

	private moveCursorToNextAction() {
		this.currentActionInTurn++;
		if (this.currentActionInTurn >= this.game.turns.get(this.currentTurn).actions.length) {
            if (this.currentTurn === this.game.turns.size) {
                return;
            }
			this.currentActionInTurn = 0;
			this.currentTurn++;
		}
	}

	private moveCursorToPreviousAction() {
		this.currentActionInTurn--;
		if (this.currentActionInTurn < 0) {
            if (this.currentTurn === 0) {
                return;
            }
			this.currentTurn--;
			this.currentActionInTurn = this.game.turns.get(this.currentTurn).actions.length - 1;
		}
	}
}
