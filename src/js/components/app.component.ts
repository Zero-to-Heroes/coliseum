import { Component, ChangeDetectionStrategy, NgZone } from '@angular/core';
import { XmlParserService } from '../services/xml-parser.service';
import { HistoryItem } from '../models/history-item';
import { Game } from '../models/game';
import { GameInitializerService } from '../services/game-initializer.service';

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

	constructor(private replayParser: XmlParserService, private gameInitializer: GameInitializerService, private zone: NgZone) {
		window['coliseum'] = {
			zone: this.zone,
			component: this
		}
	}

	public loadReplay(replayXml: Node) {
		console.log('calling loadReplay from outside');
		const replayAsString = new XMLSerializer().serializeToString(replayXml);
		console.log('replayAsString', replayAsString);
		const history: ReadonlyArray<HistoryItem> = this.replayParser.parseXml(replayAsString);
		const game: Game = this.gameInitializer.initGameWithPlayers(history);
		// game = this.gameInitializer.populateEntities(game);
		// game = this.gameInitializer.createMulliganStartState(game);
		// game = this.actionParser.createActions(game);
		
        // this.game = Game.createGame({} as Game);
        // this.game = Game.createGame(this.game, { startTimestamp: this.tsToSeconds(node.attributes.ts) });
        // this.game = Game.createGame(this.game, { history });
	}
}
