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
		private stateProcessor: StateProcessorService,
	) {}

	public async parse(replayAsString: string): Promise<Observable<[Game, boolean]>> {
		const start = Date.now();
		this.cancelled = false;
		await this.allCards.initializeCardsDb();
		this.logPerf('Retrieved cards DB, parsing replay', start);

		const iterator: IterableIterator<[Game, number]> = this.createGamePipeline(replayAsString, start);
		return Observable.create(observer => {
			this.buildObservableFunction(observer, iterator);
		});
	}

	public cancelProcessing(): void {
		this.cancelled = true;
		clearTimeout(this.processingTimeout);
	}

	private buildObservableFunction(observer, iterator: IterableIterator<[Game, number]>) {
		const itValue = iterator.next();
		// this.logger.info('calling next obersable', itValue, itValue.value);
		observer.next([itValue.value[0], itValue.done]);
		if (!itValue.done && !this.cancelled) {
			this.processingTimeout = setTimeout(() => this.buildObservableFunction(observer, iterator), itValue.value[1]);
		}
	}

	private *createGamePipeline(replayAsString: string, start: number): IterableIterator<[Game, number]> {
		const history: readonly HistoryItem[] = this.replayParser.parseXml(replayAsString);
		this.logPerf('XML parsing', start);
		yield [null, SMALL_PAUSE];

		const initialEntities = this.gamePopulationService.populateInitialEntities(history);
		this.logPerf('Populating initial entities', start);
		yield [null, SMALL_PAUSE];

		const entities: Map<number, Entity> = this.gameStateParser.populateEntitiesUntilMulliganState(history, initialEntities);
		this.logPerf('Populating entities with mulligan state', start);
		yield [null, SMALL_PAUSE];

		const gameWithPlayers: Game = this.gameInitializer.initializeGameWithPlayers(history, entities);
		this.logPerf('initializeGameWithPlayers', start);
		yield [gameWithPlayers, SMALL_PAUSE];

		const gameWithTurns: Game = this.turnParser.createTurns(gameWithPlayers, history);
		this.logPerf('createTurns', start);
		yield [gameWithTurns, SMALL_PAUSE];

		const iterator = this.actionParser.parseActions(gameWithTurns, history);
		let previousStep = gameWithTurns;
		while (true) {
			const itValue = iterator.next();
			const step = itValue.value || previousStep;
			previousStep = step;
			yield [step, SMALL_PAUSE];
			if (itValue.done) {
				break;
			}
		}
		this.logPerf('parseActions', start, previousStep);

		const gameWithActivePlayer: Game = this.activePlayerParser.parseActivePlayer(previousStep);
		this.logPerf('activePlayerParser', start);
		yield [gameWithTurns, SMALL_PAUSE];

		const gameWithActiveSpell: Game = this.activeSpellParser.parseActiveSpell(gameWithActivePlayer);
		this.logPerf('activeSpellParser', start);
		yield [gameWithActiveSpell, SMALL_PAUSE];

		const gameWithTargets: Game = this.targetsParser.parseTargets(gameWithActiveSpell);
		this.logPerf('targets', start);
		yield [gameWithTargets, SMALL_PAUSE];

		const gameWithMulligan: Game = this.mulliganParser.affectMulligan(gameWithTargets);
		this.logPerf('affectMulligan', start);
		yield [gameWithMulligan, SMALL_PAUSE];

		const gameWithEndGame: Game = this.endGameParser.parseEndGame(gameWithMulligan);
		this.logPerf('parseEndGame', start);
		yield [gameWithEndGame, SMALL_PAUSE];

		const gameWithNarrator: Game = this.narrator.populateActionText(gameWithEndGame);
		this.logPerf('populateActionText', start);
		yield [gameWithNarrator, SMALL_PAUSE];

		const gameWithFullStory: Game = this.narrator.createGameStory(gameWithNarrator);
		this.logPerf('game story', start);
		return [gameWithFullStory, SMALL_PAUSE];
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
