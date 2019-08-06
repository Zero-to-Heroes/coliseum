import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Entity } from '../../../models/game/entity';
import { NGXLogger } from 'ngx-logger';
import { Map } from 'immutable';
import { PlayState } from '../../../models/enums/playstate';
import { PlayerEntity } from '../../../models/game/player-entity';
import { GameTag } from '../../../models/enums/game-tags';

@Component({
	selector: 'end-game',
	styleUrls: ['../../../../css/components/game/overlay/end-game.component.scss'],
	template: `
		<div class="end-game">
			<img src="{{ heroImage }}" class="hero-image" />
			<img src="{{ frame }}" class="status-frame" />
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EndGameComponent {
	_entities: Map<number, Entity>;
	_playerId: number;
	_status: PlayState;
	heroImage: string;
	frame: string;

	constructor(private logger: NGXLogger) {}

	@Input('entities') set entities(entities: Map<number, Entity>) {
		this.logger.debug('[end-game] setting new entities', entities.toJS());
		this._entities = entities;
		this.updateHeroImage();
	}

	@Input('playerId') set playerId(playerId: number) {
		this.logger.debug('[end-game] setting playerId', playerId);
		this._playerId = playerId;
		this.updateHeroImage();
	}

	@Input('status') set status(value: number) {
		this.logger.debug('[end-game] setting status', value);
		this._status = value;
		this.updateFrame();
	}

	private updateFrame() {
		if (!this._status) {
			this.logger.debug('[end-game] entities not initialized yet');
			return;
		}
		const imageName = this._status === PlayState.WON ? 'victory_screen' : 'loss_screen';
		this.frame = `https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/${imageName}.png`;
	}

	private updateHeroImage() {
		if (!this._entities || !this._playerId) {
			this.logger.debug('[end-game] entities not initialized yet');
			return;
		}
		const player = this._entities
			.filter(entity => entity instanceof PlayerEntity)
			.map(entity => entity as PlayerEntity)
			.filter(entity => entity.playerId === this._playerId)
			.first();
		const heroEntityId = player.getTag(GameTag.HERO_ENTITY);
		const hero = this._entities.get(heroEntityId);
		this.heroImage = `https://static.zerotoheroes.com/hearthstone/cardart/256x/${hero.cardID}.jpg`;
	}
}
