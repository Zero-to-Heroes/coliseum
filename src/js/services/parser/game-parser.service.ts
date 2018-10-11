import { Injectable } from '@angular/core';
import { Map } from "immutable";
import * as _ from 'lodash';

import { Game } from '../../models/game/game';
import { HistoryItem } from '../../models/history/history-item';
import { ActionParserService } from './action-parser.service';
import { TurnParserService } from './turn-parser.service';
import { XmlParserService } from './xml-parser.service';
import { GamePopulationService } from './game-population.service';
import { GameStateParserService } from './game-state-parser.service';
import { GameInitializerService } from './game-initializer.service';
import { StateProcessorService } from './state-processor.service';
import { Entity } from '../../models/game/entity';

@Injectable()
export class GameParserService {

	constructor(
			private actionParser: ActionParserService,
			private replayParser: XmlParserService, 
			private turnParser: TurnParserService,
			private gamePopulationService: GamePopulationService, 
			private gameStateParser: GameStateParserService,
			private gameInitializer: GameInitializerService, 
			private stateProcessor: StateProcessorService) {
    }

    public parse(replayXml: Node): Game {
        const start = Date.now();
		const replayAsString = new XMLSerializer().serializeToString(replayXml);
		this.logPerf('Parsing replay', start);
		const history: ReadonlyArray<HistoryItem> = this.replayParser.parseXml(replayAsString);
		this.logPerf('Creating history', start);
        const entities: Map<number, Entity> = this.createEntitiesPipeline(history, start);
        return this.createGamePipeline(history, entities, start);
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
            (history, entities) => this.gameInitializer.initializeGameWithPlayers(history, entities),
			(game) => this.logPerf('initializeGameWithPlayers', start, game),
            (game) => this.turnParser.createTurns(game, history),
			(game) => this.logPerf('createTurns', start, game),
            (game) => this.actionParser.parseActions(game, history),
			(game) => this.logPerf('parseActions', start, game),
            (game) => this.stateProcessor.populateIntermediateStates(game, history),
			(game) => this.logPerf('populateIntermediateStates', start, game),
		)(history, entities);
	}

	private logPerf<T>(what: string, start: number, result?: T): T {
		console.log('[perf] ', what, 'done after ', (Date.now() - start), 'ms');
		return result;
	}
}
