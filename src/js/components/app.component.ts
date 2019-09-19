import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnDestroy, ViewRef } from '@angular/core';
import { Map } from 'immutable';
import { NGXLogger } from 'ngx-logger';
import { Subscription } from 'rxjs';
import { CardBurnAction } from '../models/action/card-burn-action';
import { DiscoverAction } from '../models/action/discover-action';
import { FatigueDamageAction } from '../models/action/fatigue-damage-action';
import { QuestCompletedAction } from '../models/action/quest-completed-action';
import { SecretRevealedAction } from '../models/action/secret-revealed-action';
import { PlayState } from '../models/enums/playstate';
import { Entity } from '../models/game/entity';
import { Game } from '../models/game/game';
import { Turn } from '../models/game/turn';
import { ReplayOptions } from '../models/replay-options';
import { Events } from '../services/events.service';
import { GameParserService } from '../services/parser/game-parser.service';

@Component({
	styleUrls: ['../../css/components/app.component.scss', '../../css/global/global.scss'],
	template: `
		<div class="coliseum wide">
			<section class="manastorm-player-wrapper">
				<div class="manastorm-player">
					<div class="aspect-ratio-wrapper ar-16x9">
						<div class="aspect-ratio-inner">
							<game
								[turn]="turnString"
								[playerId]="game && game.players[0].playerId"
								[opponentId]="game && game.players[1].playerId"
								[playerName]="game && game.players[0].name"
								[opponentName]="game && game.players[1].name"
								[activePlayer]="activePlayer"
								[activeSpell]="activeSpell"
								[isMulligan]="isMulligan"
								[isEndGame]="isEndGame"
								[endGameStatus]="endGameStatus"
								[entities]="entities"
								[targets]="targets"
								[secretRevealed]="secretRevealed"
								[questCompleted]="questCompleted"
								[discovers]="discovers"
								[burned]="burned"
								[fatigue]="fatigue"
								[chosen]="chosen"
								[options]="options"
								[showHiddenCards]="showHiddenCards"
								[crossed]="crossed"
							>
							</game>
							<preloader class="dark-theme" [ngClass]="{ 'active': !game || showPreloader }" [status]="status"></preloader>
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
	status: string;

	game: Game;
	entities: Map<number, Entity>;
	crossed: readonly number[];
	text: string;
	turnString: string;
	activePlayer: number;
	activeSpell: number;
	discovers: readonly number[];
	chosen: readonly number[];
	burned: readonly number[];
	fatigue: number;
	targets: readonly [number, number][];
	options: readonly number[];
	secretRevealed: number;
	questCompleted: number;
	showHiddenCards = false;

	isMulligan: boolean;
	isEndGame: boolean;
	endGameStatus: PlayState;

	totalTime: number;
	currentTime = 0;

	showPreloader = true;

	private currentActionInTurn = 0;
	private currentTurn = 0;
	private gameSub: Subscription;

	constructor(
		private gameParser: GameParserService,
		private events: Events,
		private cdr: ChangeDetectorRef,
		private logger: NGXLogger,
		private zone: NgZone,
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

	public reset(shouldUpdateQueryString = true) {
		this.status = null;
		this.showPreloader = true;
		this.reviewId = this.reviewId; // That was we can already start showing the links
		this.game = undefined;
		this.entities = undefined;
		this.crossed = undefined;
		this.text = undefined;
		this.turnString = undefined;
		this.activePlayer = 0;
		this.activeSpell = 0;
		this.discovers = undefined;
		this.chosen = undefined;
		this.burned = undefined;
		this.fatigue = 0;
		this.targets = undefined;
		this.options = undefined;
		this.secretRevealed = 0;
		this.questCompleted = 0;
		this.showHiddenCards = false;
		this.isMulligan = false;
		this.isEndGame = false;
		this.endGameStatus = undefined;
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

	public async loadReplay(replayXml: string, options?: ReplayOptions) {
		// Cache the info so that it's not erased by a reset
		const turn = parseInt(this.getSearchParam('turn')) || 0;
		const action = parseInt(this.getSearchParam('action')) || 0;
		const reviewId = (options && options.reviewId) || this.getSearchParam('reviewId');
		this.reset(false);
		this.status = 'Parsing replay file';
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
		const gameObs = await this.gameParser.parse(replayXml);
		this.gameSub = gameObs.subscribe(([game, status, complete]: [Game, string, boolean]) => {
			this.status = status || this.status;
			if (!(this.cdr as ViewRef).destroyed) {
				this.cdr.detectChanges();
			}
			if (complete) {
				this.logger.info('[app] Received complete game');
				this.game = game;
				this.totalTime = this.buildTotalTime();
				this.reviewId = reviewId;
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
				// We do this so that the initial drawing is already done when hiding the preloader
				setTimeout(() => {
					this.showPreloader = false;
					if (!(this.cdr as ViewRef).destroyed) {
						this.cdr.detectChanges();
					}
				}, 1500);
			}
		});
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
		if (
			!this.game ||
			!this.game.turns ||
			!this.game.turns.has(this.currentTurn) ||
			!this.game.turns.get(this.currentTurn).actions ||
			!this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn]
		) {
			this.logger.debug('[app] nothing to process', this.game, this);
			return;
		}

		this.entities = this.computeNewEntities();
		this.crossed = this.computeCrossed();
		this.text = this.computeText();
		this.turnString = this.computeTurnString();
		this.activePlayer = this.computeActivePlayer();
		this.activeSpell = this.computeActiveSpell();
		this.secretRevealed = this.computeSecretRevealed();
		this.questCompleted = this.computeQuestCompleted();
		this.targets = this.computeTargets();
		this.options = this.computeOptions();
		this.discovers = this.computeDiscovers();
		this.chosen = this.computeChosen();
		this.burned = this.computeBurned();
		this.fatigue = this.computeFatigue();
		this.isMulligan = this.computeMulligan();
		this.isEndGame = this.computeEndGame();
		this.endGameStatus = this.computeEndGameStatus();
		// This avoid truncating the query string because we don't have all the info yet
		if (complete) {
			this.currentTime = this.computeCurrentTime();
			this.updateUrlQueryString();
		}
		this.logger.debug('[app] setting turn', this.turnString);
		this.logger.debug('[app] Considering action', this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn]);
	}

	private buildTotalTime() {
		if (!this.game) {
			return;
		}
		const lastTurn: Turn = this.game.turns.last();
		for (let i = lastTurn.actions.length - 1; i >= 0; i--) {
			const lastAction = lastTurn.actions[i];
			if (lastAction.timestamp) {
				return lastAction.timestamp;
			}
		}
		return 0;
	}

	private computeCurrentTime() {
		const currentTime = this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn].timestamp || 0;
		return currentTime;
	}

	private computeActiveSpell(): number {
		return this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn].activeSpell;
	}

	private computeMulligan(): boolean {
		return this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn].isMulligan;
	}

	private computeEndGame(): boolean {
		return this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn].isEndGame;
	}

	private computeEndGameStatus(): PlayState {
		return this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn].endGameStatus;
	}

	private computeOptions(): readonly number[] {
		return this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn].options;
	}

	private computeBurned(): readonly number[] {
		const action = this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn];
		if (action instanceof CardBurnAction) {
			return action.burnedCardIds;
		}
		return null;
	}

	private computeDiscovers(): readonly number[] {
		const action = this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn];
		if (action instanceof DiscoverAction) {
			return action.choices;
		}
		return null;
	}

	private computeChosen(): readonly number[] {
		const action = this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn];
		if (action instanceof DiscoverAction) {
			return action.chosen;
		}
		return null;
	}

	private computeFatigue(): number {
		const action = this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn];
		if (action instanceof FatigueDamageAction) {
			return action.amount;
		}
		return null;
	}

	private computeSecretRevealed(): number {
		const action = this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn];
		if (action instanceof SecretRevealedAction) {
			return action.entityId;
		}
		return null;
	}

	private computeQuestCompleted(): number {
		const action = this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn];
		if (action instanceof QuestCompletedAction) {
			return action.originId;
		}
		return null;
	}

	private computeActivePlayer(): number {
		return this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn].activePlayer;
	}

	private computeNewEntities(): Map<number, Entity> {
		return this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn].entities;
	}

	private computeCrossed(): readonly number[] {
		return this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn].crossedEntities;
	}

	private computeText(): string {
		return this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn].textRaw;
	}

	private computeTurnString(): string {
		return this.game.turns.get(this.currentTurn).turn === 'mulligan' ? 'Mulligan' : `Turn${this.game.turns.get(this.currentTurn).turn}`;
	}

	private computeTargets(): readonly [number, number][] {
		return this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn].targets;
	}

	private moveCursorToNextAction() {
		if (
			this.currentActionInTurn >= this.game.turns.get(this.currentTurn).actions.length - 1 &&
			this.currentTurn >= this.game.turns.size - 1
		) {
			return;
		}
		this.currentActionInTurn++;
		if (this.currentActionInTurn >= this.game.turns.get(this.currentTurn).actions.length) {
			this.currentActionInTurn = 0;
			this.currentTurn++;
		}
		this.populateInfo();
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}

	private moveCursorToPreviousAction() {
		if (this.currentActionInTurn === 0 && this.currentTurn === 0) {
			return;
		}
		this.currentActionInTurn--;
		if (this.currentActionInTurn < 0) {
			this.currentTurn--;
			this.currentActionInTurn = this.game.turns.get(this.currentTurn).actions.length - 1;
		}
		this.populateInfo();
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}

	private moveCursorToNextTurn() {
		if (this.currentTurn >= this.game.turns.size - 1) {
			return;
		}
		this.currentActionInTurn = 0;
		this.currentTurn++;
		this.populateInfo();
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}

	private moveCursorToPreviousTurn() {
		if (this.currentTurn === 0) {
			return;
		}
		this.currentActionInTurn = 0;
		this.currentTurn--;
		this.populateInfo();
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}

	private getSearchParam(name: string): string {
		const searchString = window.location.search.substring(1);
		const searchParams = searchString.split('&');
		return searchParams
			.filter(param => param.indexOf('=') !== -1)
			.filter(param => param.split('=')[0] === name)
			.map(param => param.split('=')[1])[0];
	}

	private updateUrlQueryString() {
		const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
		const reviewQuery = this.reviewId ? `reviewId=${this.reviewId}&` : '';
		const queryString = `${reviewQuery}turn=${this.currentTurn}&action=${this.currentActionInTurn}`;
		const newUrl = `${baseUrl}?${queryString}`;
		window.history.replaceState({ path: newUrl }, '', newUrl);
	}
}
