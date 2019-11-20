import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CardType, GameTag, Zone } from '@firestone-hs/reference-data';
import { Entity } from '@firestone-hs/replay-parser';
import { Map } from 'immutable';
import { NGXLogger } from 'ngx-logger';
import { GameHelper } from '../../services/game-helper';

@Component({
	selector: 'play-area',
	styleUrls: ['../../../css/components/game/play-area.component.scss'],
	template: `
		<div class="play-area" [ngClass]="{ 'mulligan': _isMulligan }">
			<hand [entities]="hand" [showCards]="_showCards" [options]="handOptions" [controller]="playerEntity"></hand>
			<hero [entities]="_entities" [playerId]="_playerId" [opponentId]="opponentId" [options]="_options"> </hero>
			<board
				[entities]="board"
				[enchantmentCandidates]="enchantmentCandidates"
				[options]="boardOptions"
				[isMainPlayer]="isMainPlayer"
				[isRecruitPhase]="isRecruitPhase"
			>
			</board>
			<mana-tray
				[total]="totalCrystals"
				[available]="availableCrystals"
				[empty]="emptyCrystals"
				[locked]="lockedCrystals"
				[futureLocked]="futureLockedCrystals"
			>
			</mana-tray>
			<deck [deck]="deck"></deck>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayAreaComponent {
	_isMulligan: string;
	_entities: Map<number, Entity>;
	_playerId: number;
	_showCards = true;

	hand: readonly Entity[];
	handOptions: readonly number[];
	board: readonly Entity[];
	enchantmentCandidates: readonly Entity[];
	boardOptions: readonly number[];
	deck: readonly Entity[];
	playerEntity: Entity;

	totalCrystals: number;
	availableCrystals: number;
	emptyCrystals: number;
	lockedCrystals: number;
	futureLockedCrystals: number;
	isRecruitPhase: boolean;

	_options: readonly number[];

	constructor(private logger: NGXLogger) {}

	@Input() opponentId: number;
	@Input() isMainPlayer: boolean;

	@Input('mulligan') set mulligan(value: string) {
		this.logger.debug('[play-area] setting mulligan', value);
		this._isMulligan = value;
	}

	@Input('entities') set entities(entities: Map<number, Entity>) {
		this.logger.debug('[play-area] setting new entities', entities && entities.toJS());
		this._entities = entities;
		this.updateEntityGroups();
	}

	@Input('showCards') set showCards(value: boolean) {
		this.logger.debug('[mulligan] setting showCards', value);
		this._showCards = value;
	}

	@Input('options') set options(value: readonly number[]) {
		this.logger.debug('[play-area] setting options', value);
		this._options = value;
		this.updateEntityGroups();
	}

	@Input('playerId') set playerId(playerId: number) {
		this.logger.debug('[play-area] setting playerId', playerId);
		this._playerId = playerId;
		this.updateEntityGroups();
	}

	private updateEntityGroups() {
		if (!this._entities || !this._playerId) {
			this.logger.debug('[play-area] entities not initialized yet');
			return;
		}

		this.playerEntity = this._entities.find(entity => entity.getTag(GameTag.PLAYER_ID) === this._playerId);
		this.hand = this.getHandEntities(this._playerId);
		this.handOptions = GameHelper.getOptions(this.hand, this._options);
		this.board = this.getBoardEntities(this._playerId);
		this.boardOptions = GameHelper.getOptions(this.board, this._options);
		this.enchantmentCandidates = this.getEnchantmentCandidates(this.board, this._entities.toArray());
		this.deck = this.getDeckEntities(this._playerId);

		this.totalCrystals = this.playerEntity.getTag(GameTag.RESOURCES) || 0;
		this.availableCrystals = this.totalCrystals - (this.playerEntity.getTag(GameTag.RESOURCES_USED) || 0);
		this.lockedCrystals = this.playerEntity.getTag(GameTag.OVERLOAD_LOCKED) || 0;
		this.emptyCrystals = this.totalCrystals - this.availableCrystals - this.lockedCrystals;
		this.futureLockedCrystals = this.playerEntity.getTag(GameTag.OVERLOAD_OWED) || 0;

		const gameEntity = GameHelper.getGameEntity(this._entities);
		this.isRecruitPhase = gameEntity.getTag(GameTag.BOARD_VISUAL_STATE) === 1;
		this.logger.debug('[play-area] play-area entities updated', this.hand);
	}

	private getHandEntities(playerId: number): readonly Entity[] {
		return this._entities
			.toArray()
			.filter(entity => entity.getTag(GameTag.CONTROLLER) === playerId)
			.filter(entity => entity.getTag(GameTag.ZONE) === Zone.HAND)
			.sort((a, b) => a.getTag(GameTag.ZONE_POSITION) - b.getTag(GameTag.ZONE_POSITION));
	}

	private getDeckEntities(playerId: number): readonly Entity[] {
		return this._entities
			.toArray()
			.filter(entity => entity.getTag(GameTag.CONTROLLER) === playerId)
			.filter(entity => entity.getTag(GameTag.ZONE) === Zone.DECK);
	}

	private getBoardEntities(playerId: number): readonly Entity[] {
		return this._entities
			.toArray()
			.filter(entity => entity.getTag(GameTag.CONTROLLER) === playerId)
			.filter(entity => entity.getTag(GameTag.ZONE) === Zone.PLAY)
			.filter(entity => entity.getTag(GameTag.CARDTYPE) === CardType.MINION)
			.sort((a, b) => a.getTag(GameTag.ZONE_POSITION) - b.getTag(GameTag.ZONE_POSITION));
	}

	private getEnchantmentCandidates(board: readonly Entity[], entities: readonly Entity[]): readonly Entity[] {
		const boardIds = board.map(entity => entity.id);
		return entities
			.filter(entity => entity.zone() === Zone.PLAY)
			.filter(entity => boardIds.indexOf(entity.getTag(GameTag.ATTACHED)) !== -1);
	}
}
