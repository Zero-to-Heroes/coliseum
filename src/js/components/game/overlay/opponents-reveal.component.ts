import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CardType, GameTag, Zone } from '@firestone-hs/reference-data';
import { Entity } from '@firestone-hs/replay-parser';
import { Map } from 'immutable';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'opponents-reveal',
	styleUrls: ['../../../../css/components/game/overlay/opponents-reveal.component.scss'],
	template: `
		<div class="opponents-reveal">
			<ul class="opponents">
				<li
					*ngFor="let entity of opponents; let i = index; trackBy: trackByFn"
					[style.left.%]="positionOffsetLeft(i)"
					[style.top.%]="positionOffsetTop(i)"
					[style.transform]="transform(i)"
				>
					<hero-card [hero]="entity"> </hero-card>
				</li>
			</ul>
			<img
				class="vs"
				src="https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/battlegrounds/vs_letters.png"
			/>
			<hero-card class="player" [hero]="player"> </hero-card>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpponentRevealedComponent {
	_entities: Map<number, Entity>;
	_playerId: number;
	_opponentIds: readonly number[];

	player: Entity;
	opponents: readonly Entity[];

	constructor(private logger: NGXLogger) {}

	@Input('entities') set entities(entities: Map<number, Entity>) {
		this.logger.debug('[opponents-revealed] setting new entities', entities && entities.toJS());
		this._entities = entities;
		this.updateEntityGroups();
	}

	@Input('playerId') set playerId(playerId: number) {
		this.logger.debug('[opponents-revealed] setting playerId', playerId);
		this._playerId = playerId;
		this.updateEntityGroups();
	}

	@Input('opponentIds') set opponentIds(value: readonly number[]) {
		this.logger.debug('[opponents-revealed] setting opponentIds', value);
		this._opponentIds = value;
		this.updateEntityGroups();
	}

	trackByFn(index, item: Entity) {
		return item.id;
	}

	positionOffsetLeft(i: number): number {
		// prettier-ignore
		switch (i) {
			case 0: return 8;
			case 1: return 5;
			case 2: return 2;
			case 3: return 0;
			case 4: return -2;
			case 5: return -5;
			case 6: return -8;
			default: return 0;
		}
	}

	positionOffsetTop(i: number): number {
		// prettier-ignore
		switch (i) {
			case 0: return 18;
			case 1: return 9;
			case 2: return 2;
			case 3: return 0;
			case 4: return 2;
			case 5: return 9;
			case 6: return 18
			default: return 0;
		}
	}

	transform(i: number): string {
		let rotateAmount = 0;
		// prettier-ignore
		switch (i) {
			case 0: rotateAmount = -19; break;
			case 1: rotateAmount = -11; break;
			case 2: rotateAmount = -8; break;
			case 3: rotateAmount = 0; break;
			case 4: rotateAmount = 8; break;
			case 5: rotateAmount = 11; break;
			case 6: rotateAmount = 19; break;
			default: rotateAmount = 0; break;
		}
		return `rotate(${rotateAmount}deg)`;
	}

	private updateEntityGroups() {
		if (!this._entities || !this._playerId || !this._opponentIds) {
			this.logger.debug('[opponents-revealed] entities not initialized yet');
			return;
		}

		this.opponents = this.getOpponentEntities();
		this.player = this.getPlayerEntity();
	}

	private getOpponentEntities(): readonly Entity[] {
		return this._entities
			.toArray()
			.filter(entity => this._opponentIds.indexOf(entity.id) !== -1)
			.sort((a, b) => a.getTag(GameTag.ZONE_POSITION) - b.getTag(GameTag.ZONE_POSITION));
	}

	private getPlayerEntity(): Entity {
		return this._entities
			.toArray()
			.filter(entity => entity.getTag(GameTag.CONTROLLER) === this._playerId)
			.filter(entity => entity.getTag(GameTag.ZONE) === Zone.PLAY)
			.filter(entity => entity.getCardType() === CardType.HERO)[0];
	}
}
