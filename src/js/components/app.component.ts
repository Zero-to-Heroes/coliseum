import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnDestroy, ViewRef } from '@angular/core';
import { GameType } from '@firestone-hs/reference-data';
import {
	Action,
	BaconBoardVisualStateAction,
	BattlegroundsSimulationParserService,
	Game,
	GameParserService,
	Turn,
} from '@firestone-hs/replay-parser';
import { GameSample } from '@firestone-hs/simulate-bgs-battle/dist/simulation/spectator/game-sample';
import { NGXLogger } from 'ngx-logger';
import { Subscription } from 'rxjs';
import { ReplayOptions } from '../models/replay-options';
import { AnalyticsService } from '../services/analytics.service';
import { Events } from '../services/events.service';
import { GameConfService } from '../services/game-conf.service';

declare let ga;

@Component({
	styleUrls: ['../../css/components/app.component.scss', '../../css/global/global.scss'],
	template: `
		<div class="coliseum wide">
			<section class="manastorm-player-wrapper">
				<div class="manastorm-player">
					<div class="aspect-ratio-wrapper ar-16x9">
						<div class="aspect-ratio-inner">
							<game
								[gameMode]="gameMode"
								[playerId]="game && game.players[0].playerId"
								[opponentId]="game && game.players[1].playerId"
								[playerName]="game && game.players[0].name"
								[opponentName]="game && game.players[1].name"
								[currentAction]="currentAction"
								[showHiddenCards]="showHiddenCards"
							>
							</game>
							<div class="status" *ngIf="status">
								Game is loading. The viewing experience will be optimal once loading is complete.
								{{ status }}...
							</div>
							<preloader
								class="dark-theme"
								[ngClass]="{ 'active': showPreloader }"
								[status]="status"
							></preloader>
						</div>
					</div>
				</div>
			</section>
			<seeker
				class="ignored-wrapper"
				[totalTime]="totalTime"
				[currentTime]="currentTime"
				[active]="game && !showPreloader"
				(seek)="onSeek($event)"
			>
			</seeker>
			<turn-narrator class="ignored-wrapper" [text]="text" [active]="game && !showPreloader"></turn-narrator>
			<controls
				class="ignored-wrapper"
				[reviewId]="reviewId"
				[active]="game && !showPreloader"
				(nextAction)="onNextAction()"
				(nextTurn)="onNextTurn()"
				(previousAction)="onPreviousAction()"
				(previousTurn)="onPreviousTurn()"
				(showHiddenCards)="onShowHiddenCards($event)"
			>
			</controls>
			<tooltips></tooltips>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnDestroy {
	reviewId: string;
	bgsSimulationString: string;
	bgsSimulationId: string;
	status: string;
	game: Game;
	currentAction: Action;
	text: string;
	turnString: string;
	showHiddenCards = true;
	totalTime: number;
	currentTime = 0;
	showPreloader = true;
	gameMode: string;

	private currentActionInTurn = 0;
	private currentTurn = 0;
	private gameSub: Subscription;

	constructor(
		private gameParser: GameParserService,
		private bgsSimulationParser: BattlegroundsSimulationParserService,
		private gameConf: GameConfService,
		private events: Events,
		private cdr: ChangeDetectorRef,
		private logger: NGXLogger,
		private zone: NgZone,
		private analytics: AnalyticsService,
	) {
		logger.debug('building coliseum app component');
		const existingColiseum = window['coliseum'] || {};
		logger.debug('existing', existingColiseum);
		window['coliseum'] = Object.assign(existingColiseum, {
			zone: this.zone,
			component: this,
		});
		logger.debug('new coliseum', window['coliseum']);
	}

	public reset(reviewId?: string, shouldUpdateQueryString = true) {
		console.log('in reset', reviewId, shouldUpdateQueryString);
		this.status = null;
		this.showPreloader = true;
		this.reviewId = reviewId ?? this.reviewId; // That was we can already start showing the links
		this.bgsSimulationString = undefined;
		this.bgsSimulationId = undefined;
		delete this.game;
		this.game = undefined;
		this.currentAction = undefined;

		this.text = undefined;
		this.turnString = undefined;
		this.showHiddenCards = true;
		this.gameMode = undefined;
		this.totalTime = undefined;
		this.currentTime = 0;
		this.currentActionInTurn = 0;
		this.currentTurn = 0;
		if (shouldUpdateQueryString) {
			this.updateUrlQueryString();
		}
		this.gameParser.cancelProcessing();
		if (this.gameSub) {
			this.gameSub.unsubscribe();
		}
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}

	public updateStatus(newStatus: string) {
		console.log('updating status', newStatus);
		this.status = newStatus;
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}

	public async parseBgsSimulation(bgsSimulation: GameSample) {
		this.analytics.event('start-bgs-simulation-parse');
		this.reset(this.reviewId, false);
		this.bgsSimulationString = this.getSearchParam('bgsSimulation');
		this.bgsSimulationId = this.getSearchParam('bgsSimulationId');
		this.status = 'Parsing bgsSimulationString simulation';
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
		const game = await this.bgsSimulationParser.parse(bgsSimulation);
		console.log('parsed bgs simulation', game);
		const turn = 0;
		const action = 0;
		this.game = game;
		this.currentTurn = turn <= 0 ? 0 : turn >= this.game.turns.size ? this.game.turns.size - 1 : turn;
		this.currentActionInTurn =
			action <= 0
				? 0
				: action >= this.game.turns.get(this.currentTurn).actions.length
				? this.game.turns.get(this.currentTurn).actions.length - 1
				: action;
		this.populateInfo(true);
		this.showPreloader = false;
		this.status = null;
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
		this.analytics.event('bgs-simulation-loaded');
	}

	public async loadReplay(replayXml: string, options?: ReplayOptions) {
		this.analytics.event('start-replay-load');
		// Cache the info so that it's not erased by a reset
		// const turn = parseInt(this.getSearchParam('turn')) || 0;
		// const action = parseInt(this.getSearchParam('action')) || 0;
		const reviewId = (options && options.reviewId) || this.getSearchParam('reviewId');
		// this.reviewId = reviewId;
		this.reset(reviewId, false);
		console.log('setting review id from loadReplay', this.reviewId);
		this.status = 'Parsing replay file';
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}

		const gameObs = await this.gameParser.parse(replayXml);
		// console.log('gameObs', gameObs);
		this.gameSub = gameObs.subscribe(
			([game, status, complete]: [Game, string, boolean]) => {
				this.status = status || this.status;
				if (!(this.cdr as ViewRef).destroyed) {
					this.cdr.detectChanges();
				}
				if (game) {
					// Since the user can already navigate before the game is fully loaded, we want
					// to restore the navigation to where the user currently is
					const turn = parseInt(this.getSearchParam('turn')) || 0;
					const action = parseInt(this.getSearchParam('action')) || 0;
					this.game = game;
					this.totalTime = this.buildTotalTime();
					this.reviewId = reviewId;
					// console.log('re-setting review id', this.reviewId);
					this.currentTurn = turn <= 0 ? 0 : turn >= this.game.turns.size ? this.game.turns.size - 1 : turn;
					this.currentActionInTurn =
						action <= 0
							? 0
							: action >= this.game.turns.get(this.currentTurn).actions.length
							? this.game.turns.get(this.currentTurn).actions.length - 1
							: action;
					this.populateInfo(complete);
					if (!(this.cdr as ViewRef).destroyed) {
						this.cdr.detectChanges();
					}

					if (complete) {
						this.status = null;
						console.log(
							'[app] Received complete game',
							game.turns.size,
							// game.fullStoryRaw,
							// game.turns.toJS(),
						);
						this.analytics.event('replay-loaded');

						// if (game.turns.size === 0) {
						// 	this.status = 'An error occured while parsing the replay';
						// 	this.showPreloader = true;
						// }
					}

					// We do this so that the initial drawing is already done when hiding the preloader
					setTimeout(() => {
						this.showPreloader = false;
						if (!game || !game.turns || (game.turns.size === 0 && complete)) {
							console.log('showing error status because no turns');
							this.status = 'error';
							this.showPreloader = true;
						}
						if (!(this.cdr as ViewRef).destroyed) {
							this.cdr.detectChanges();
						}
					}, 1500);
				} else {
					console.log('showing error status because no game');
					this.showPreloader = true;
					this.status = 'error';
					if (!(this.cdr as ViewRef).destroyed) {
						this.cdr.detectChanges();
					}
				}
			},
			error => {
				console.error('Could not parse replay', error);
				this.status = 'error';
				if (!(this.cdr as ViewRef).destroyed) {
					this.cdr.detectChanges();
				}
			},
		);
	}

	ngOnDestroy() {
		this.gameSub.unsubscribe();
	}

	onNextAction() {
		this.moveCursorToNextAction();
	}

	onNextTurn() {
		this.moveCursorToNextTurn();
	}

	onPreviousAction() {
		this.moveCursorToPreviousAction();
	}

	onPreviousTurn() {
		this.moveCursorToPreviousTurn();
	}

	onShowHiddenCards(event) {
		this.showHiddenCards = event;
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}

	onSeek(targetTimestamp: number) {
		if (!this.game) {
			this.logger.warn('[app] game not present, not performing operation', 'onSeek');
			return;
		}
		this.logger.debug('[app] seeking target timestamp', targetTimestamp);
		let lastActionIndex = 0;
		let lastTurnIndex = 0;
		for (let turnIndex = 0; turnIndex < this.game.turns.size; turnIndex++) {
			const turn = this.game.turns.get(turnIndex);
			for (let actionIndex = 0; actionIndex < turn.actions.length; actionIndex++) {
				const action = turn.actions[actionIndex];
				if (action.timestamp > targetTimestamp) {
					break;
				}
				lastActionIndex = actionIndex;
				lastTurnIndex = turnIndex;
			}
		}
		this.currentTurn = lastTurnIndex;
		this.currentActionInTurn = lastActionIndex;
		this.logger.debug(
			'[app] finished seeking',
			this.currentTurn,
			this.currentActionInTurn,
			this.game.turns.toJS(),
			this.game.turns.get(this.currentTurn).actions,
		);
		this.populateInfo();
		// So that the value is always what the user actually selected, and there are no weird jumps
		this.currentTime = targetTimestamp;
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}

	private populateInfo(complete = true) {
		this.gameConf.updateConfig(this.game);
		if (
			!this.game ||
			!this.game.turns ||
			!this.game.turns.has(this.currentTurn) ||
			!this.game.turns.get(this.currentTurn).actions ||
			!this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn]
		) {
			this.logger.debug(
				'[app] nothing to process',
				this.game.turns,
				this.currentTurn,
				this.game.turns.get(this.currentTurn),
			);
			return;
		}

		this.currentAction = this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn];
		this.text = this.computeText();
		this.turnString = this.computeTurnString();
		this.gameMode = this.computeGameMode();
		// This avoid truncating the query string because we don't have all the info yet
		if (complete) {
			this.currentTime = this.computeCurrentTime();
			this.updateUrlQueryString();
		}
		// console.log(
		// 	'[app] Considering action',
		// 	this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn],
		// 	this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn].damages?.toJS(),
		// );
	}

	private buildTotalTime() {
		if (!this.game) {
			return;
		}
		const lastTurn: Turn = this.game.turns.get(this.game.turns.size - 1);
		// console.log('last turn', lastTurn, this.game.turns.size, this.game.turns.toJS());
		if (!lastTurn) {
			return;
		}
		for (let i = lastTurn.actions.length - 1; i >= 0; i--) {
			const lastAction = lastTurn.actions[i];
			if (lastAction.timestamp) {
				return lastAction.timestamp;
			}
		}
		return 0;
	}

	private computeCurrentTime() {
		if (!this.game) {
			this.logger.warn('[app] game not present, not performing operation', 'computeCurrentTime');
			return;
		}
		const currentTime = this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn].timestamp || 0;
		return currentTime;
	}

	private computeGameMode(): string {
		if (!this.game) {
			this.logger.warn('[app] game not present, not performing operation', 'computeGameMode');
			return;
		}
		if (
			this.game.gameType === GameType.GT_BATTLEGROUNDS ||
			this.game.gameType === GameType.GT_BATTLEGROUNDS_FRIENDLY
		) {
			return 'battlegrounds';
		}
		return null;
	}

	private computeText(): string {
		if (!this.game) {
			this.logger.warn('[app] game not present, not performing operation', 'computeText');
			return;
		}
		return this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn].textRaw;
	}

	private computeTurnString(): string {
		if (!this.game) {
			this.logger.warn('[app] game not present, not performing operation', 'computeTurnString');
			return;
		}
		return this.game.turns.get(this.currentTurn).turn === 'mulligan'
			? 'Mulligan'
			: `Turn${this.game.turns.get(this.currentTurn).turn}`;
	}

	private moveCursorToNextAction() {
		if (!this.game || !this.game.turns) {
			return;
		}
		if (
			this.currentActionInTurn >= this.game.turns.get(this.currentTurn).actions.length - 1 &&
			this.currentTurn >= this.game.turns.size - 1
		) {
			// console.log(
			// 	'cannot go further',
			// 	this.currentActionInTurn,
			// 	this.currentTurn,
			// 	this.game.turns.size,
			// 	this.game.turns.toJS(),
			// );
			return;
		}
		this.currentActionInTurn++;
		if (this.currentActionInTurn >= this.game.turns.get(this.currentTurn).actions.length) {
			this.currentActionInTurn = 0;
			this.currentTurn++;
			// console.log('went further', this.currentTurn, this.currentActionInTurn);
		}
		const currentTurn = this.game.turns.get(this.currentTurn);
		if (
			currentTurn.actions.length === 0 ||
			(currentTurn.actions.length === 1 && currentTurn.actions[0] instanceof BaconBoardVisualStateAction)
		) {
			this.moveCursorToNextAction();
			return;
		}
		this.populateInfo();
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}

	private moveCursorToPreviousAction() {
		if (!this.game || !this.game.turns) {
			return;
		}
		if (this.currentActionInTurn === 0 && this.currentTurn === 0) {
			return;
		}
		this.currentActionInTurn--;
		if (this.currentActionInTurn < 0) {
			this.currentTurn--;
			this.currentActionInTurn = this.game.turns.get(this.currentTurn).actions.length - 1;
		}
		this.populateInfo();
		const currentTurn = this.game.turns.get(this.currentTurn);
		if (
			currentTurn.actions.length === 0 ||
			(currentTurn.actions.length === 1 && currentTurn.actions[0] instanceof BaconBoardVisualStateAction)
		) {
			this.moveCursorToPreviousAction();
			return;
		}
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}

	private moveCursorToNextTurn() {
		if (!this.game || !this.game.turns) {
			return;
		}
		if (this.currentTurn >= this.game.turns.size - 1) {
			return;
		}
		this.currentActionInTurn = 0;
		this.currentTurn++;
		this.populateInfo();
		const currentTurn = this.game.turns.get(this.currentTurn);
		if (
			currentTurn.actions.length === 0 ||
			(currentTurn.actions.length === 1 && currentTurn.actions[0] instanceof BaconBoardVisualStateAction)
		) {
			this.moveCursorToNextTurn();
			return;
		}
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}

	private moveCursorToPreviousTurn() {
		if (!this.game || !this.game.turns) {
			return;
		}
		if (this.currentTurn === 0) {
			return;
		}
		this.currentActionInTurn = 0;
		this.currentTurn--;
		this.populateInfo();
		const currentTurn = this.game.turns.get(this.currentTurn);
		if (
			currentTurn.actions.length === 0 ||
			(currentTurn.actions.length === 1 && currentTurn.actions[0] instanceof BaconBoardVisualStateAction)
		) {
			this.moveCursorToPreviousTurn();
			return;
		}
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}

	private getSearchParam(name: string): string {
		const searchString = window.location.search.substring(1);
		const searchParams = searchString?.split('&') || [];
		return searchParams
			.filter(param => param.indexOf('=') !== -1)
			.filter(param => param.split('=')[0] === name)
			.map(param => param.split('=')[1])[0];
	}

	private updateUrlQueryString() {
		const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
		const reviewQuery = this.reviewId
			? `reviewId=${this.reviewId}&`
			: this.bgsSimulationString
			? `bgsSimulation=${this.bgsSimulationString}&`
			: this.bgsSimulationId
			? `bgsSimulationId=${this.bgsSimulationId}&`
			: '';
		const queryString = `${reviewQuery}turn=${this.currentTurn}&action=${this.currentActionInTurn}`;
		const newUrl = `${baseUrl}?${queryString}`;
		window.history.replaceState({ path: newUrl }, '', newUrl);
	}
}
