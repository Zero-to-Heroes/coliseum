import { Component, ChangeDetectionStrategy, NgZone, ChangeDetectorRef, HostListener, AfterViewInit, ViewRef } from '@angular/core';
import { Map } from 'immutable';
import { Key } from 'ts-keycode-enum';
import { Entity } from '../models/game/entity';
import { Game } from '../models/game/game';
import { GameParserService } from '../services/parser/game-parser.service';
import { Events } from '../services/events.service';

@Component({
	selector: 'app-root',
	styleUrls: [
		'../../css/components/app.component.scss'
	],
	template: `
		<div class="coliseum">
			<game *ngIf="game"
				[playerId]="game.players[0].playerId" 
				[opponentId]="game.players[1].playerId"
				[entities]="entities">
			</game>
			<tooltips></tooltips>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {

	game: Game;
	entities: Map<number, Entity>;

	private currentActionInTurn: number = 0;
	private currentTurn: number = 0;

	constructor(
			private gameParser: GameParserService,
			private events: Events,
			private cdr: ChangeDetectorRef,
			private zone: NgZone) {
		window['coliseum'] = {
			zone: this.zone,
			component: this
		};
		this.cdr.detach();
	}

	public loadReplay(replayXml: Node) {
		this.game = this.gameParser.parse(replayXml);
		console.log('[app] Converted game', this.game);
		this.entities = this.computeNewEntities();
        if (!(<ViewRef>this.cdr).destroyed) {
            this.cdr.detectChanges();
        }
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
		this.entities = this.computeNewEntities();
        if (!(<ViewRef>this.cdr).destroyed) {
            this.cdr.detectChanges();
        }
	}

	private computeNewEntities(): Map<number, Entity> {
		return this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn].entities;
	}

	private moveCursorToNextAction() {
		this.currentActionInTurn++;
		if (this.currentActionInTurn >= this.game.turns.get(this.currentTurn).actions.length) {
			this.currentActionInTurn = 0;
			this.currentTurn++;
		}
	}

	private moveCursorToPreviousAction() {
		this.currentActionInTurn--;
		if (this.currentActionInTurn < 0) {
			this.currentTurn--;
			this.currentActionInTurn = this.game.turns.get(this.currentTurn).actions.length - 1;
		}
	}
}
