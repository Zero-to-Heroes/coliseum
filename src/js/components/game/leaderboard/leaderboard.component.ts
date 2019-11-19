import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { GameTag } from '@firestone-hs/reference-data';
import { AllCardsService, Entity, PlayerEntity } from '@firestone-hs/replay-parser';
import { Map } from 'immutable';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'leaderboard',
	styleUrls: ['../../../../css/components/game/leaderboard/leaderboard.component.scss'],
	template: `
		<div class="leaderboard">
			<div class="entities" [transition-group]="'flip-list'">
				<leaderboard-entity
					transition-group-item
					*ngFor="let entity of leaderboard; let i = index; trackBy: trackByFn"
					[ngClass]="{ 'next-opponent': isNextOpponent(entity) }"
					[entity]="entity"
					[isMainPlayer]="isMainPlayer(entity)"
				>
				</leaderboard-entity>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardComponent {
	_entities: Map<number, Entity>;
	_playerId: number;
	leaderboard: readonly Entity[];
	nextOpponentPlayerId: number;

	private playerEntity: PlayerEntity;

	constructor(private logger: NGXLogger, private cards: AllCardsService) {}

	@Input() set playerId(value: number) {
		this._playerId = value;
		this.updateLeaderboard();
	}

	@Input() set entities(value: Map<number, Entity>) {
		this._entities = value;
		this.updateLeaderboard();
	}

	isMainPlayer(entity: Entity): boolean {
		const result = this.playerEntity && entity.getTag(GameTag.CONTROLLER) === this.playerEntity.playerId;
		// console.log('is main player', this.playerEntity.tags.toJS());
		return result;
	}

	isNextOpponent(entity: Entity): boolean {
		return entity.getTag(GameTag.PLAYER_ID) === this.nextOpponentPlayerId;
	}

	trackByFn(index, item: Entity) {
		return item.id;
	}

	private updateLeaderboard() {
		if (!this._entities || !this._playerId) {
			this.leaderboard = [];
			return;
		}
		this.playerEntity =
			this._entities &&
			(this._entities.find(entity => entity.getTag(GameTag.PLAYER_ID) === this._playerId) as PlayerEntity);
		this.leaderboard = this._entities
			.toArray()
			.filter(entity => entity.getTag(GameTag.PLAYER_LEADERBOARD_PLACE) > 0)
			.sort((a, b) => a.getTag(GameTag.PLAYER_LEADERBOARD_PLACE) - b.getTag(GameTag.PLAYER_LEADERBOARD_PLACE));
		console.log('leaderboard', this.leaderboard.map(entity => entity.cardID));
		this.nextOpponentPlayerId = this.playerEntity.getTag(GameTag.NEXT_OPPONENT_PLAYER_ID);
	}
}
