import { Injectable } from '@angular/core';
import { Map } from 'immutable';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';
import { Entity } from '../../models/game/entity';
import { Game } from '../../models/game/game';
import { HistoryItem } from '../../models/history/history-item';
import { AllCardsService } from '../all-cards.service';
import { GamePopulationService } from './entitiespipeline/game-population.service';
import { GameStateParserService } from './entitiespipeline/game-state-parser.service';
import { ActionParserService } from './gamepipeline/action-parser.service';
import { ActivePlayerParserService } from './gamepipeline/active-player-parser.service';
import { ActiveSpellParserService } from './gamepipeline/active-spell-parser.service';
import { EndGameParserService } from './gamepipeline/end-game-parser.service';
import { GameInitializerService } from './gamepipeline/game-initializer.service';
import { MulliganParserService } from './gamepipeline/mulligan-parser.service';
import { NarratorService } from './gamepipeline/narrator.service';
import { TargetsParserService } from './gamepipeline/targets-parser.service';
import { TurnParserService } from './gamepipeline/turn-parser.service';
import { ImagePreloaderService } from './image-preloader.service';
import { StateProcessorService } from './state-processor.service';
import { XmlParserService } from './xml-parser.service';

const SMALL_PAUSE = 7;

@Injectable()
export class GameParserService {
	private cancelled: boolean;
	private processingTimeout: NodeJS.Timeout;

	constructor(
		private allCards: AllCardsService,
		private actionParser: ActionParserService,
		private turnParser: TurnParserService,
		private imagePreloader: ImagePreloaderService,
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
		private stateProcessor: StateProcessorService,
	) {}

	public async parse(replayAsString: string): Promise<Observable<[Game, string, boolean]>> {
		const start = Date.now();
		this.cancelled = false;
		if (this.processingTimeout) {
			clearTimeout(this.processingTimeout);
			this.processingTimeout = undefined;
		}
		await this.allCards.initializeCardsDb();
		this.logPerf('Retrieved cards DB, parsing replay', start);

		const iterator: IterableIterator<[Game, number, string]> = this.createGamePipeline(replayAsString, start);
		return Observable.create(observer => {
			this.buildObservableFunction(observer, iterator);
		});
	}

	public cancelProcessing(): void {
		this.cancelled = true;
		clearTimeout(this.processingTimeout);
	}

	private buildObservableFunction(observer, iterator: IterableIterator<[Game, number, string]>) {
		// this.logger.info('calling next iteration');
		const itValue = iterator.next();
		// this.logger.info('calling next obersable', itValue, itValue.value);
		observer.next([itValue.value[0], itValue.value[2], itValue.done]);
		if (!itValue.done && !this.cancelled) {
			this.processingTimeout = setTimeout(() => this.buildObservableFunction(observer, iterator), itValue.value[1]);
		}
	}

	private *createGamePipeline(replayAsString: string, start: number): IterableIterator<[Game, number, string]> {
		const history: readonly HistoryItem[] = new XmlParserService(this.logger).parseXml(replayAsString);
		this.logPerf('XML parsing', start);
		yield [null, SMALL_PAUSE, 'XML parsing done'];

		const preloadIterator = this.imagePreloader.preloadImages(history);
		while (true) {
			const itValue = preloadIterator.next();
			yield [null, SMALL_PAUSE, null];
			if (itValue.done) {
				break;
			}
		}
		yield [null, SMALL_PAUSE, 'Images preloading started'];
		this.logPerf('Started image preloading', start);

		const initialEntities = this.gamePopulationService.populateInitialEntities(history);
		this.logPerf('Populating initial entities', start);
		yield [null, SMALL_PAUSE, 'Populated initial entities'];

		const entities: Map<number, Entity> = this.gameStateParser.populateEntitiesUntilMulliganState(history, initialEntities);
		this.logPerf('Populating entities with mulligan state', start);
		yield [null, SMALL_PAUSE, 'Prepared Mulligan state'];

		const gameWithPlayers: Game = this.gameInitializer.initializeGameWithPlayers(history, entities);
		this.logPerf('initializeGameWithPlayers', start);
		yield [gameWithPlayers, SMALL_PAUSE, 'Initialized Game'];

		const gameWithTurns: Game = this.turnParser.createTurns(gameWithPlayers, history);
		this.logPerf('createTurns', start);
		yield [gameWithTurns, SMALL_PAUSE, 'Created turns'];

		const iterator = this.actionParser.parseActions(gameWithTurns, history);
		let previousStep = gameWithTurns;
		while (true) {
			const itValue = iterator.next();
			const step = itValue.value[0] || previousStep;
			previousStep = step;
			yield [step, SMALL_PAUSE, 'Finished processing turn ' + itValue.value[1]];
			if (itValue.done) {
				break;
			}
		}
		this.logPerf('parseActions', start);

		const gameWithActivePlayer: Game = this.activePlayerParser.parseActivePlayer(previousStep);
		this.logPerf('activePlayerParser', start);
		yield [gameWithTurns, SMALL_PAUSE, 'Parsed active players'];

		const gameWithActiveSpell: Game = this.activeSpellParser.parseActiveSpell(gameWithActivePlayer);
		this.logPerf('activeSpellParser', start);
		yield [gameWithActiveSpell, SMALL_PAUSE, 'Parsed active spells'];

		const gameWithTargets: Game = this.targetsParser.parseTargets(gameWithActiveSpell);
		this.logPerf('targets', start);
		yield [gameWithTargets, SMALL_PAUSE, 'Parsed targets'];

		const gameWithMulligan: Game = this.mulliganParser.affectMulligan(gameWithTargets);
		this.logPerf('affectMulligan', start);
		yield [gameWithMulligan, SMALL_PAUSE, null];

		const gameWithEndGame: Game = this.endGameParser.parseEndGame(gameWithMulligan);
		this.logPerf('parseEndGame', start);
		yield [gameWithEndGame, SMALL_PAUSE, 'Parsed end game'];

		const gameWithNarrator: Game = this.narrator.populateActionText(gameWithEndGame);
		this.logPerf('populateActionText', start);
		yield [gameWithNarrator, SMALL_PAUSE, 'Populated actions text'];

		const gameWithFullStory: Game = this.narrator.createGameStory(gameWithNarrator);
		this.logPerf('game story', start);
		return [gameWithFullStory, SMALL_PAUSE, 'Rendering game state'];
	}

	private logPerf<T>(what: string, start: number, result?: T): T {
		this.logger.info('[perf] ', what, 'done after ', Date.now() - start, 'ms');
		return result;
	}
}

export interface GameProcessingStep {
	game: Game;
	shouldBubble: boolean;
}
