import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewRef } from '@angular/core';
import { GameTag, PlayState } from '@firestone-hs/reference-data';
import {
	Action,
	BaconOpponentRevealedAction,
	CardBurnAction,
	DiscoverAction,
	Entity,
	FatigueDamageAction,
	QuestCompletedAction,
	SecretRevealedAction,
} from '@firestone-hs/replay-parser';
import { Map } from 'immutable';
import { NGXLogger } from 'ngx-logger';
import { Events } from '../../services/events.service';

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
				'in-overlay': isOverlay,
				'mulligan': _isMulligan || _isHeroSelection || _opponentsRevealed?.length > 0,
				'quest': _quest
			}"
		>
			<div class="play-areas">
				<play-area
					class="top"
					[mulligan]="_isMulligan"
					[entities]="_entities"
					[options]="_options"
					[showCards]="_showHiddenCards"
					[playerId]="_opponentId"
				>
				</play-area>
				<play-area
					class="bottom"
					[mulligan]="_isMulligan"
					[entities]="_entities"
					[options]="_options"
					[playerId]="_playerId"
				>
				</play-area>
			</div>
			<player-name class="player-name top" [name]="_opponentName" [active]="_opponentId === _activePlayer">
			</player-name>
			<player-name class="player-name bottom" [name]="_playerName" [active]="_playerId === _activePlayer">
			</player-name>
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
			<div class="overlays" *ngIf="isOverlay">
				<mulligan
					*ngIf="_isMulligan && !_isHeroSelection"
					class="top"
					[entities]="_entities"
					[crossed]="_crossed"
					[showCards]="_showHiddenCards"
					[playerId]="_opponentId"
				>
				</mulligan>
				<mulligan
					*ngIf="_isMulligan && !_isHeroSelection"
					class="bottom"
					[entities]="_entities"
					[crossed]="_crossed"
					[playerId]="_playerId"
				>
				</mulligan>
				<hero-selection
					*ngIf="_isHeroSelection"
					class="bottom"
					[entities]="_entities"
					[crossed]="_crossed"
					[playerId]="_playerId"
				>
				</hero-selection>
				<opponents-reveal
					*ngIf="_opponentsRevealed"
					[entities]="_entities"
					[opponentIds]="_opponentsRevealed"
					[playerId]="_playerId"
				>
				</opponents-reveal>
				<end-game *ngIf="_isEndGame" [status]="_endGameStatus" [entities]="_entities" [playerId]="_playerId">
				</end-game>
				<discover *ngIf="_discovers" [entities]="_entities" [choices]="_discovers" [chosen]="_chosen">
				</discover>
				<burn *ngIf="_burned" [entities]="_entities" [burned]="_burned"> </burn>
				<fatigue *ngIf="_fatigue" [fatigue]="_fatigue"></fatigue>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent implements AfterViewInit {
	_turn: string;
	_entities: Map<number, Entity>;
	_crossed: readonly number[] = [];
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

	_quest: Entity;
	isOverlay: boolean;
	_fatigue: number;
	_discovers: readonly number[];
	_burned: readonly number[];
	_chosen: readonly number[];
	_isMulligan: boolean;
	_isHeroSelection: boolean;
	_opponentsRevealed: readonly number[];
	_isEndGame: boolean;
	_endGameStatus: PlayState;

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
		this.logger.debug('[game] setting new action', value);
		this._entities = value ? value.entities : undefined;
		this._crossed = value ? value.crossedEntities : undefined;
		this._activePlayer = value ? value.activePlayer : undefined;
		this.activeSpellId = value ? value.activeSpell : undefined;
		this.secretRevealedId = value instanceof SecretRevealedAction ? value.entityId : null;
		this.questCompletedId = value instanceof QuestCompletedAction ? value.originId : null;
		this._burned = value instanceof CardBurnAction ? value.burnedCardIds : null;
		this._fatigue = value instanceof FatigueDamageAction ? value.amount : null;
		this._discovers = value instanceof DiscoverAction ? value.choices : null;
		this._chosen = value instanceof DiscoverAction ? value.chosen : null;
		this._isMulligan = value ? value.isMulligan : null;
		this._isHeroSelection = value ? value.isHeroSelection : null;
		this._isEndGame = value ? value.isEndGame : null;
		this._endGameStatus = value ? value.endGameStatus : null;
		this._targets = value ? value.targets : null;
		this._options = value ? value.options : null;
		this._opponentsRevealed = value instanceof BaconOpponentRevealedAction ? value.opponentIds : null;
		this.updateActiveSpell();
		this.updateSecretRevealed();
		this.updateQuestCompleted();
		this.updateOverlay();
	}

	private updateOverlay() {
		this.isOverlay =
			this._isMulligan ||
			this._isHeroSelection ||
			(this._opponentsRevealed && this._opponentsRevealed.length > 0) ||
			this._isEndGame ||
			(this._discovers && this._discovers.length > 0) ||
			(this._burned && this._burned.length > 0) ||
			this._fatigue > 0;
		console.log('is overlay?', this.isOverlay, this._opponentsRevealed && this._opponentsRevealed.length > 0);
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
}
