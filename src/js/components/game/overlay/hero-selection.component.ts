import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { GameTag, Zone } from '@firestone-hs/reference-data';
import { Entity } from '@firestone-hs/replay-parser';
import { Map } from 'immutable';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'hero-selection',
	styleUrls: ['../../../../css/components/game/overlay/hero-selection.component.scss'],
	template: `
		<div class="hero-selection">
			<li *ngFor="let entity of mulliganCards; let i = index; trackBy: trackByFn">
				<hero-card [hero]="entity" [ngClass]="{ 'picked': _crossed.indexOf(entity.id) === -1 }"> </hero-card>
			</li>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSelectionComponent {
	_entities: Map<number, Entity>;
	_playerId: number;
	_crossed: readonly number[];
	_showCards = true;

	mulliganCards: readonly Entity[];

	constructor(private logger: NGXLogger) {}

	@Input('entities') set entities(entities: Map<number, Entity>) {
		this.logger.debug('[mulligan] setting new entities', entities && entities.toJS());
		this._entities = entities;
		this.updateEntityGroups();
	}

	@Input('crossed') set crossed(value: readonly number[]) {
		this._crossed = value;
	}

	@Input('playerId') set playerId(playerId: number) {
		this.logger.debug('[mulligan] setting playerId', playerId);
		this._playerId = playerId;
		this.updateEntityGroups();
	}

	@Input('showCards') set showCards(value: boolean) {
		this.logger.debug('[mulligan] setting showCards', value);
		this._showCards = value;
	}

	trackByFn(index, item: Entity) {
		return item.id;
	}

	private updateEntityGroups() {
		if (!this._entities || !this._playerId) {
			this.logger.debug('[mulligan] entities not initialized yet');
			return;
		}

		this.mulliganCards = this.getMulliganEntities(this._playerId);
	}

	private getMulliganEntities(playerId: number): readonly Entity[] {
		return this._entities
			.toArray()
			.filter(entity => entity.getTag(GameTag.CONTROLLER) === playerId)
			.filter(entity => entity.getTag(GameTag.ZONE) === Zone.HAND)
			.sort((a, b) => a.getTag(GameTag.ZONE_POSITION) - b.getTag(GameTag.ZONE_POSITION));
	}
}
