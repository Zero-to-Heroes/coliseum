import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { PlayState } from '@firestone-hs/reference-data';
import {
	Action,
	BaconBoardVisualStateAction,
	BaconOpponentRevealedAction,
	CardBurnAction,
	DiscoverAction,
	Entity,
	FatigueDamageAction,
} from '@firestone-hs/replay-parser';
import { Map } from 'immutable';
import { NGXLogger } from 'ngx-logger';
import { Events } from '../../../services/events.service';

@Component({
	selector: 'overlays',
	styleUrls: ['../../../../css/components/game/overlay/overlays.component.scss'],
	template: `
		<div class="overlays">
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
				*ngIf="_isHeroSelection && !_opponentsRevealed"
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
			<discover *ngIf="_discovers" [entities]="_entities" [choices]="_discovers" [chosen]="_chosen"> </discover>
			<burn *ngIf="_burned" [entities]="_entities" [burned]="_burned"> </burn>
			<fatigue *ngIf="_fatigue" [fatigue]="_fatigue"></fatigue>
			<visual-board-state-change
				*ngIf="_baconBoardStateChange"
				[state]="_baconBoardStateChange"
			></visual-board-state-change>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverlaysComponent {
	@Output() overlayUpdated: EventEmitter<{ isOverlay: boolean; isDarkOverlay: boolean }> = new EventEmitter();

	isOverlay: boolean;
	action: Action;
	_entities: Map<number, Entity>;
	_crossed: readonly number[] = [];
	_playerId: number;
	_opponentId: number;
	_showHiddenCards: boolean;
	_fatigue: number;
	_discovers: readonly number[];
	_burned: readonly number[];
	_chosen: readonly number[];
	_isMulligan: boolean;
	_isHeroSelection: boolean;
	_opponentsRevealed: readonly number[];
	_isEndGame: boolean;
	_endGameStatus: PlayState;
	_baconBoardStateChange: number;

	constructor(private logger: NGXLogger, private events: Events, private cdr: ChangeDetectorRef) {}

	@Input('playerId') set playerId(playerId: number) {
		this.logger.debug('[overlays] setting playerId', playerId);
		this._playerId = playerId;
	}

	@Input('opponentId') set opponentId(opponentId: number) {
		this.logger.debug('[overlays] setting opponentId', opponentId);
		this._opponentId = opponentId;
	}

	@Input('showHiddenCards') set showHiddenCards(value: boolean) {
		this.logger.debug('[overlays] setting showHiddenCards', value);
		this._showHiddenCards = value;
	}

	@Input() set currentAction(value: Action) {
		if (value === this.action) {
			return;
		}
		this.logger.debug('[overlays] setting new action', value);
		this.action = value;
		this._entities = value ? value.entities : undefined;
		this._crossed = value ? value.crossedEntities : undefined;
		this._burned = value instanceof CardBurnAction ? value.burnedCardIds : null;
		this._fatigue = value instanceof FatigueDamageAction ? value.amount : null;
		this._discovers = value instanceof DiscoverAction ? value.choices : null;
		this._chosen = value instanceof DiscoverAction ? value.chosen : null;
		this._isMulligan = value ? value.isMulligan : null;
		this._isHeroSelection = value ? value.isHeroSelection : null;
		this._isEndGame = value ? value.isEndGame : null;
		this._endGameStatus = value ? value.endGameStatus : null;
		this._opponentsRevealed = value instanceof BaconOpponentRevealedAction ? value.opponentIds : null;
		this._baconBoardStateChange = value instanceof BaconBoardVisualStateAction ? value.newState : null;
		// console.log('_baconBoardStateChange', this._baconBoardStateChange);
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
			this._baconBoardStateChange > 0 ||
			this._fatigue > 0;
		const isDarkOverlay =
			this._isMulligan ||
			this._isHeroSelection ||
			(this._opponentsRevealed && this._opponentsRevealed.length > 0);
		this.overlayUpdated.next({ isOverlay: this.isOverlay, isDarkOverlay: isDarkOverlay });
	}
}
