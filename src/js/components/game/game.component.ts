import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewRef } from '@angular/core';
import { GameTag } from '@firestone-hs/reference-data';
import {
	Action,
	ActionButtonUsedAction,
	Entity,
	QuestCompletedAction,
	SecretRevealedAction,
} from '@firestone-hs/replay-parser';
import { Map } from 'immutable';
import { NGXLogger } from 'ngx-logger';
import { Events } from '../../services/events.service';
import { GameHelper } from '../../services/game-helper';

@Component({
	selector: 'game',
	styleUrls: [
		'../../../css/components/game/game.component.scss',
		'../../../css/components/game/game-battlegrounds.scss',
	],
	template: `
		<div
			class="game {{ gameMode }}"
			[ngClass]="{
				'blur': isOverlay,
				'dark-blur': isDarkOverlay,
				'quest': _quest,
				'recruit': isRecruitPhase
			}"
		>
			<div class="play-areas">
				<play-area
					class="top"
					[mulligan]="isDarkOverlay"
					[entities]="_entities"
					[options]="_options"
					[showCards]="_showHiddenCards"
					[playerId]="_opponentId"
					[opponentId]="_playerId"
					[isMainPlayer]="false"
					[isRecruitPhase]="isRecruitPhase"
					[entitiesToAnimate]="_entitiesToAnimate"
				>
				</play-area>
				<play-area
					class="bottom"
					[mulligan]="isDarkOverlay"
					[entities]="_entities"
					[options]="_options"
					[playerId]="_playerId"
					[isMainPlayer]="true"
					[isRecruitPhase]="isRecruitPhase"
					[entitiesToAnimate]="_entitiesToAnimate"
				>
				</play-area>
			</div>
			<player-name class="player-name top" [name]="_opponentName" [active]="_opponentId === _activePlayer">
			</player-name>
			<player-name class="player-name bottom" [name]="_playerName" [active]="_playerId === _activePlayer">
			</player-name>
			<leaderboard
				*ngIf="gameMode === 'battlegrounds'"
				class="leaderboard"
				[entities]="_entities"
				[playerId]="_playerId"
			></leaderboard>
			<active-spell
				class="active-spell"
				*ngIf="_activeSpell"
				[entity]="_activeSpell"
				[controller]="_activeSpellController"
			>
			</active-spell>
			<secret-revealed class="secret-revealed" *ngIf="_secretRevealed" [entity]="_secretRevealed">
			</secret-revealed>
			<quest-tooltip *ngIf="_quest" [quest]="_quest"></quest-tooltip>
			<quest-completed *ngIf="_questCompleted" [quest]="_questCompleted"></quest-completed>
			<target-zone *ngIf="_targets" [targets]="_targets" [active]="_playerId === _activePlayer"> </target-zone>
			<overlays
				[playerId]="_playerId"
				[currentAction]="_currentAction"
				[opponentId]="_opponentId"
				[showHiddenCards]="_showHiddenCards"
				(overlayUpdated)="onOverlayUpdated($event)"
			>
			</overlays>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent implements AfterViewInit {
	_currentAction: Action;
	_entities: Map<number, Entity>;
	_playerId: number;
	_opponentId: number;
	_playerName: string;
	_opponentName: string;
	_activePlayer: number;
	_secretRevealed: Entity;
	_questCompleted: Entity;
	_activeSpell: Entity;
	_activeSpellController: Entity;
	_targets: readonly [number, number][] = [];
	_options: readonly number[] = [];
	_showHiddenCards: boolean;
	_entitiesToAnimate: readonly number[];

	_quest: Entity;
	isOverlay: boolean;
	isDarkOverlay: boolean;
	isRecruitPhase: boolean;

	@Input() gameMode: string;

	private activeSpellId: number;
	private secretRevealedId: number;
	private questCompletedId: number;

	constructor(private logger: NGXLogger, private events: Events, private cdr: ChangeDetectorRef) {}

	ngAfterViewInit() {
		this.events.on(Events.SHOW_QUEST_TOOLTIP).subscribe(data => {
			this._quest = data.data[0];
			if (!(this.cdr as ViewRef).destroyed) {
				this.cdr.detectChanges();
			}
		});
		this.events.on(Events.HIDE_QUEST_TOOLTIP).subscribe(data => {
			this._quest = undefined;
			if (!(this.cdr as ViewRef).destroyed) {
				this.cdr.detectChanges();
			}
		});
	}

	@Input('playerId') set playerId(playerId: number) {
		this.logger.debug('[game] setting playerId', playerId);
		this._playerId = playerId;
	}

	@Input('opponentId') set opponentId(opponentId: number) {
		this.logger.debug('[game] setting opponentId', opponentId);
		this._opponentId = opponentId;
	}

	@Input('playerName') set playerName(value: string) {
		this.logger.debug('[game] setting playerName', value);
		this._playerName = value;
	}

	@Input('opponentName') set opponentName(value: string) {
		this.logger.debug('[game] setting opponentName', value);
		this._opponentName = value;
	}

	@Input('showHiddenCards') set showHiddenCards(value: boolean) {
		this.logger.debug('[game] setting showHiddenCards', value);
		this._showHiddenCards = value;
	}

	@Input() set currentAction(value: Action) {
		console.debug('[game] setting new action', value);
		this._currentAction = value;
		this._entities = value ? value.entities : undefined;
		this._activePlayer = value ? value.activePlayer : undefined;
		this.activeSpellId = value ? value.activeSpell : undefined;
		this.secretRevealedId = value instanceof SecretRevealedAction ? value.entityId : null;
		this.questCompletedId = value instanceof QuestCompletedAction ? value.originId : null;
		// console.log('setting current action', value, value?.targets);
		this._targets = value ? value.targets : null;
		this._options = value ? value.options : null;
		// console.log('set options', this._options);

		const gameEntity = GameHelper.getGameEntity(this._entities);
		this.isRecruitPhase = gameEntity && gameEntity.getTag(GameTag.BOARD_VISUAL_STATE) === 1;

		this.updateActiveSpell();
		this.updateSecretRevealed();
		this.updateQuestCompleted();
		this.updateEntitiesToAnimate();
	}

	onOverlayUpdated(event: { isOverlay: boolean; isDarkOverlay: boolean }) {
		// console.log('overlay updated', event);
		this.isOverlay = event.isOverlay;
		this.isDarkOverlay = event.isDarkOverlay;
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}

	private updateActiveSpell() {
		this._activeSpell = this._entities && this.activeSpellId && this._entities.get(this.activeSpellId);
		this._activeSpellController =
			this._entities && this._entities.find(entity => entity.getTag(GameTag.PLAYER_ID) === this._playerId);
	}

	private updateSecretRevealed() {
		this._secretRevealed = this._entities && this.secretRevealedId && this._entities.get(this.secretRevealedId);
	}

	private updateQuestCompleted() {
		this._questCompleted = this._entities && this.questCompletedId && this._entities.get(this.questCompletedId);
	}

	private updateEntitiesToAnimate() {
		this._entitiesToAnimate = null;
		if (this._currentAction instanceof ActionButtonUsedAction) {
			this._entitiesToAnimate = [this._currentAction.entityId];
		}
	}
}
