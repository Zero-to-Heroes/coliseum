import { Component, ChangeDetectionStrategy, NgZone, ChangeDetectorRef, HostListener } from '@angular/core';
import { Map } from 'immutable';
import { Key } from 'ts-keycode-enum';
import * as _ from 'lodash';

import { XmlParserService } from '../services/xml-parser.service';
import { HistoryItem } from '../models/history/history-item';
import { GamePopulationService } from '../services/game-population.service';
import { Entity } from '../models/game/entity';
import { Game } from '../models/game/game';
import { GameInitializerService } from '../services/game-initializer.service';
import { GameStateParserService } from '../services/game-state-parser.service';
import { Turn } from '../models/game/turn';
import { TurnParserService } from '../services/turn-parser.service';
import { ActionParserService } from '../services/action-parser.service';
import { StateProcessorService } from '../services/state-processor.service';

@Component({
	selector: 'app-root',
	styleUrls: [],
	template: `
		<div>
			<game *ngIf="game"
				[playerId]="game.players[0].playerId" 
				[opponentId]="game.players[1].playerId"
				[entities]="entities">
			</game>
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
			private actionParser: ActionParserService,
			private replayParser: XmlParserService, 
			private turnParser: TurnParserService,
			private gamePopulationService: GamePopulationService, 
			private gameStateParser: GameStateParserService,
			private gameInitializer: GameInitializerService, 
			private stateProcessor: StateProcessorService,
			private cdr: ChangeDetectorRef,
			private zone: NgZone) {
		window['coliseum'] = {
			zone: this.zone,
			component: this
		};
		this.cdr.detach();
	}

	public loadReplay(replayXml: Node) {
        const start = Date.now();
		const replayAsString = new XMLSerializer().serializeToString(replayXml);
		this.logPerf('Parsing replay', start);
		const history: ReadonlyArray<HistoryItem> = this.replayParser.parseXml(replayAsString);
		this.logPerf('Creating history', start);
		const entities: Map<number, Entity> = this.createEntitiesPipeline(history, start);
		this.game = this.gameInitializer.initializeGameWithPlayers(history, entities);
		this.logPerf('initializeGameWithPlayers', start);
		const turns: Map<number, Turn> = this.turnParser.createTurns(this.game, history);
		this.logPerf('parsed turns', start);
		this.game = Game.createGame(this.game, { turns: turns });
		const turnsWithActions: Map<number, Turn> = this.actionParser.parseActions(this.game, history);
		this.logPerf('parsed actions', start);
		const turnsWithActionsAndEntities: Map<number, Turn> = this.stateProcessor.populateIntermediateStates(this.game, history, turnsWithActions);
		this.game = Game.createGame(this.game, { turns: turnsWithActionsAndEntities });
		this.logPerf('added actions to turns', start);
		this.entities = this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn].entities;
		this.cdr.detectChanges();

		// console.log('initialized entities', entities.toJS());
		// console.log('initialized turns', turns.toJS());
		// console.log('initialized actions', turnsWithActions.toJS());
		console.log('initialized actions with entities', turnsWithActionsAndEntities.toJS());
		// console.log('initialized game', this.game, this.game.turns.toJS());
	}

	private createEntitiesPipeline(history: ReadonlyArray<HistoryItem>, start: number): Map<number, Entity> {
		return _.flow(
			(result) => this.gamePopulationService.populateInitialEntities(result),
			(result) => this.logPerf('Populating initial entities', start, result),
			(result: Map<number, Entity>) => this.gameStateParser.populateEntitiesUntilMulliganState(history, result),
			(result) => this.logPerf('Populating entities with mulligan state', start, result), 
		)(history);
	}

	private logPerf<T>(what: string, start: number, result?: T): T {
		console.log('[perf] ', what, 'done after ', (Date.now() - start), 'ms');
		return result;
	}

	@HostListener('document:keyup', ['$event'])
	onKeyPressHandler(event: KeyboardEvent) {
		if (event.which === Key.RightArrow) {
			this.currentActionInTurn++;
			if (this.currentActionInTurn >= this.game.turns.get(this.currentTurn).actions.length) {
				this.currentActionInTurn = 0;
				this.currentTurn++;
			}
			this.entities = this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn].entities;
			this.cdr.detectChanges();
		}
	}
}
