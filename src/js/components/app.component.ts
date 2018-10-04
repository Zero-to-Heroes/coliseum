import { Component, ChangeDetectionStrategy, NgZone } from '@angular/core';
import { XmlParserService } from '../services/xml-parser.service';
import { HistoryItem } from '../models/history-item';
import { GamePopulationService } from '../services/game-population.service';
import { Entity } from '../models/entity';
import { Map } from 'immutable';
import { Game } from '../models/game';
import { GameInitializerService } from '../services/game-initializer.service';
import { GameStateParserService } from '../services/game-state-parser.service';

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
        console.debug('[perf] Parsing replay done after ', (Date.now() - start), 'ms');
		const history: ReadonlyArray<HistoryItem> = this.replayParser.parseXml(replayAsString);
        console.debug('[perf] Creating history done after ', (Date.now() - start), 'ms');
		let entities: Map<number, Entity> = this.gamePopulationService.populateInitialEntities(history);
        console.debug('[perf] Populating initial entities done after ', (Date.now() - start), 'ms');
		entities = this.gameStateParser.populateEntitiesUntilMulliganState(history, entities);
        console.debug('[perf] Populating entities with mulligan state done after ', (Date.now() - start), 'ms');
		console.log('initialized entities', entities.toJS());
		const game: Game = this.gameInitializer.initializeGameWithPlayers(history, entities);
        console.debug('[perf] initializeGameWithPlayers done after ', (Date.now() - start), 'ms');
		// game = this.gameInitializer.populateEntities(game);
		// game = this.gameInitializer.createMulliganStartState(game);
		// game = this.actionParser.createActions(game);
		
        // this.game = Game.createGame({} as Game);
        // this.game = Game.createGame(this.game, { startTimestamp: this.tsToSeconds(node.attributes.ts) });
        // this.game = Game.createGame(this.game, { history });
	}
}
