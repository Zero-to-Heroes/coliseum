import { Component, ChangeDetectionStrategy, NgZone } from '@angular/core';
import { Map } from 'immutable';
import * as _ from 'lodash';

import { XmlParserService } from '../services/xml-parser.service';
import { HistoryItem } from '../models/history/history-item';
import { GamePopulationService } from '../services/game-population.service';
import { Entity } from '../models/entity';
import { Game } from '../models/game';
import { GameInitializerService } from '../services/game-initializer.service';
import { GameStateParserService } from '../services/game-state-parser.service';
import { Turn } from '../models/turn';

@Component({
	selector: 'app-root',
	styleUrls: [],
	template: `
		<div>
			Ok, loaded
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {

	constructor(
		private replayParser: XmlParserService, 
		private gamePopulationService: GamePopulationService, 
		private gameStateParser: GameStateParserService,
		private gameInitializer: GameInitializerService, 
		private zone: NgZone) {
		window['coliseum'] = {
			zone: this.zone,
			component: this
		}
	}

	public loadReplay(replayXml: Node) {
        const start = Date.now();
		const replayAsString = new XMLSerializer().serializeToString(replayXml);
		this.logPerf('Parsing replay', start);
		const history: ReadonlyArray<HistoryItem> = this.replayParser.parseXml(replayAsString);
		this.logPerf('Creating history', start);
		const entities: Map<number, Entity> = this.createEntitiesPipeline(history, start);
		const game: Game = this.gameInitializer.initializeGameWithPlayers(history, entities);
		this.logPerf('initializeGameWithPlayers', start);
		const turns: Map<number, Turn> = this.gameStateParser.createTurns(game, history);
		console.log('initialized entities', entities.toJS());
		console.log('initialized game', game);
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
}
