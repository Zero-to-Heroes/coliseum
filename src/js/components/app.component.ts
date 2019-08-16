import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, ViewRef } from '@angular/core';
import { Map } from 'immutable';
import { NGXLogger } from 'ngx-logger';
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
								*ngIf="game"
								[turn]="turnString"
								[playerId]="game.players[0].playerId"
								[opponentId]="game.players[1].playerId"
								[playerName]="game.players[0].name"
								[opponentName]="game.players[1].name"
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
						</div>
					</div>
				</div>
			</section>
			<seeker
				class="ignored-wrapper"
				*ngIf="totalTime > 0"
				[totalTime]="totalTime"
				[currentTime]="currentTime"
				(seek)="onSeek($event)"
			>
			</seeker>
			<turn-narrator class="ignored-wrapper" [text]="text"></turn-narrator>
			<controls
				class="ignored-wrapper"
				[reviewId]="reviewId"
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
export class AppComponent {
	reviewId: string;

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

	private currentActionInTurn = 0;
	private currentTurn = 0;

	constructor(
		private gameParser: GameParserService,
		private events: Events,
		private cdr: ChangeDetectorRef,
		private logger: NGXLogger,
		private zone: NgZone,
	) {
		console.log('building coliseum app component');
		const existingColiseum = window['coliseum'] || {};
		console.log('existing', existingColiseum);
		window['coliseum'] = Object.assign(existingColiseum, {
			zone: this.zone,
			component: this,
		});
		console.log('new coliseum', window['coliseum']);
	}

	public async loadReplay(replayXml: string, options?: ReplayOptions) {
		this.game = await this.gameParser.parse(replayXml);
		this.logger.info('[app] Converted game');
		this.totalTime = this.buildTotalTime();
		const turn = parseInt(this.getSearchParam('turn')) || 0;
		const action = parseInt(this.getSearchParam('action')) || 0;
		this.reviewId = (options && options.reviewId) || this.getSearchParam('reviewId');
		this.currentTurn = turn <= 0 ? 0 : turn >= this.game.turns.size ? this.game.turns.size - 1 : turn;
		this.currentActionInTurn =
			action <= 0
				? 0
				: action >= this.game.turns.get(this.currentTurn).actions.length
				? this.game.turns.get(this.currentTurn).actions.length - 1
				: action;
		this.populateInfo();
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
		let lastActionIndex: number;
		let lastTurnIndex: number;
		for (let turnIndex = 0; turnIndex < this.game.turns.size - 1; turnIndex++) {
			const turn = this.game.turns.get(turnIndex);
			for (let actionIndex = 0; actionIndex < turn.actions.length - 1; actionIndex++) {
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
		this.populateInfo();
	}

	private populateInfo() {
		if (!this.game) {
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
		this.currentTime = this.computeCurrentTime();
		this.updateUrlQueryString();
		this.logger.debug('[app] setting turn', this.turnString);
		this.logger.info('[app] Considering action', this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn]);
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}

	private buildTotalTime() {
		if (!this.game) {
			return;
		}
		const lastTurn: Turn = this.game.turns.last();
		for (let i = lastTurn.actions.length - 1; i >= 0; i--) {
			const lastAction = lastTurn.actions[lastTurn.actions.length - i];
			if (lastAction.timestamp) {
				return lastAction.timestamp;
			}
		}
		return 0;
	}

	private computeCurrentTime() {
		const currentTime = this.game.turns.get(this.currentTurn).actions[this.currentActionInTurn].timestamp;
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
	}

	private moveCursorToNextTurn() {
		if (this.currentTurn >= this.game.turns.size - 1) {
			return;
		}
		this.currentActionInTurn = 0;
		this.currentTurn++;
		this.populateInfo();
	}

	private moveCursorToPreviousTurn() {
		if (this.currentTurn === 0) {
			return;
		}
		this.currentActionInTurn = 0;
		this.currentTurn--;
		this.populateInfo();
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
