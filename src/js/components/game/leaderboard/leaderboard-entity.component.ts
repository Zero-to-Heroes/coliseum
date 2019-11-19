import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AllCardsService, Entity } from '@firestone-hs/replay-parser';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'leaderboard-entity',
	styleUrls: ['../../../../css/components/game/leaderboard/leaderboard-entity.component.scss'],
	template: `
		<div class="leaderboard-entity" [ngClass]="{ 'main-player': _playerId === _entity.id }">
			<img class="portrait" [src]="image" />
			<img class="frame" [src]="leaderboardFrame" />
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardEntityComponent {
	image: string;
	leaderboardFrame: string;
	_entity: Entity;
	_isMainPlayer: boolean;

	constructor(private logger: NGXLogger, private cards: AllCardsService) {}

	@Input() set isMainPlayer(value: boolean) {
		this._isMainPlayer = value;
		console.log('setting main player', value);
		this.updateEntity();
	}

	@Input() set entity(value: Entity) {
		this._entity = value;
		this.image = `https://static.zerotoheroes.com/hearthstone/cardart/256x/${value.cardID}.jpg`;
		this.updateEntity();
	}

	private updateEntity() {
		if (!this._entity) {
			return;
		}
		const frame = this._isMainPlayer ? 'leaderboard_frame_player' : 'leaderboard_frame_opponent';
		console.log('updating frame');
		this.leaderboardFrame = `https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/battlegrounds/${frame}.png`;
	}
}
