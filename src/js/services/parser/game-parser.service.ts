import { Injectable } from '@angular/core';
import { Map } from 'immutable';
import * as _ from 'lodash';

import { Game } from '../../models/game/game';
import { HistoryItem } from '../../models/history/history-item';
import { ActionParserService } from './gamepipeline/action-parser.service';
import { TurnParserService } from './gamepipeline/turn-parser.service';
import { XmlParserService } from './xml-parser.service';
import { GamePopulationService } from './entitiespipeline/game-population.service';
import { GameStateParserService } from './entitiespipeline/game-state-parser.service';
import { GameInitializerService } from './gamepipeline/game-initializer.service';
import { StateProcessorService } from './state-processor.service';
import { Entity } from '../../models/game/entity';
import { NGXLogger } from 'ngx-logger';
import { NarratorService } from './gamepipeline/narrator.service';
import { ActiveSpellParserService } from './gamepipeline/active-spell-parser.service';
import { MulliganParserService } from './gamepipeline/mulligan-parser.service';
import { TargetsParserService } from './gamepipeline/targets-parser.service';
import { EndGameParserService } from './gamepipeline/end-game-parser.service';
import { ActivePlayerParserService } from './gamepipeline/active-player-parser.service';

@Injectable()
export class GameParserService {

	constructor(
			private actionParser: ActionParserService,
			private replayParser: XmlParserService,
			private turnParser: TurnParserService,
			private gamePopulationService: GamePopulationService,
			private gameStateParser: GameStateParserService,
			private gameInitializer: GameInitializerService,
			private activePlayerParser: ActivePlayerParserService,
			private activeSpellParser: ActiveSpellParserService,
			private targetsParser: TargetsParserService,
			private mulliganParser: MulliganParserService,
			private endGameParser: EndGameParserService,
			private narrator: NarratorService,
			private logger: NGXLogger,
			private stateProcessor: StateProcessorService) {
	}

	public parse(replayAsString: string): Game {
		const start = Date.now();
		this.logPerf('Parsing replay', start);
		const history: ReadonlyArray<HistoryItem> = this.replayParser.parseXml(replayAsString);
		this.logPerf('Creating history', start);
		const entities: Map<number, Entity> = this.createEntitiesPipeline(history, start);
		const game: Game = this.createGamePipeline(history, entities, start);
		this.logger.info('full story', game.fullStoryRaw);
		return game;
	}

	private createEntitiesPipeline(history: ReadonlyArray<HistoryItem>, start: number): Map<number, Entity> {
		return _.flow(
			(result) => this.gamePopulationService.populateInitialEntities(result),
			(result) => this.logPerf('Populating initial entities', start, result),
			(result: Map<number, Entity>) => this.gameStateParser.populateEntitiesUntilMulliganState(history, result),
			(result) => this.logPerf('Populating entities with mulligan state', start, result),
		)(history);
	}

	private createGamePipeline(history: ReadonlyArray<HistoryItem>, entities: Map<number, Entity>, start: number): Game {
		return _.flow(
			(hist, ent) => this.gameInitializer.initializeGameWithPlayers(hist, ent),
			(game) => this.logPerf('initializeGameWithPlayers', start, game),
			(game) => this.turnParser.createTurns(game, history),
			(game) => this.logPerf('createTurns', start, game),
			(game) => this.actionParser.parseActions(game, history),
			(game) => this.logPerf('parseActions', start, game),
			(game) => this.activePlayerParser.parseActivePlayer(game),
			(game) => this.logPerf('activePlayerParser', start, game),
			(game) => this.activeSpellParser.parseActiveSpell(game),
			(game) => this.logPerf('activeSpellParser', start, game),
			(game) => this.targetsParser.parseTargets(game),
			(game) => this.logPerf('targets', start, game),
			// Add the red cross for mulligan
			(game) => this.mulliganParser.affectMulligan(game),
			(game) => this.logPerf('affectMulligan', start, game),
			(game) => this.endGameParser.parseEndGame(game),
			(game) => this.logPerf('parseEndGame', start, game),
			(game) => this.narrator.populateActionText(game),
			(game) => this.logPerf('populateActionText', start, game),
			(game) => this.narrator.createGameStory(game),
			(game) => this.logPerf('game story', start, game),
		)(history, entities);
	}

	private logPerf<T>(what: string, start: number, result?: T): T {
		this.logger.info('[perf] ', what, 'done after ', (Date.now() - start), 'ms');
		return result;
	}
}
