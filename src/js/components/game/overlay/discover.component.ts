import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Entity } from '@firestone-hs/replay-parser';
import { Map } from 'immutable';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'discover',
	styleUrls: ['../../../../css/components/game/overlay/discover.component.scss'],
	template: `
		<div class="discover">
			<li *ngFor="let entity of discoverCards; let i = index; trackBy: trackByFn">
				<card
					[entity]="entity"
					[hasTooltip]="false"
					[ngClass]="{ 'chosen': _chosen?.indexOf(entity.id) !== -1 }"
				></card>
			</li>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscoverComponent {
	_entities: Map<number, Entity>;
	_choices: readonly number[];
	_chosen: readonly number[];

	discoverCards: readonly Entity[];

	constructor(private logger: NGXLogger) {}

	@Input('entities') set entities(entities: Map<number, Entity>) {
		this.logger.debug('[discover] setting new entities', entities && entities.toJS());
		this._entities = entities;
		this.updateEntityGroups();
	}

	@Input('choices') set choices(value: readonly number[]) {
		this.logger.debug('[discover] setting choices', value);
		this._choices = value;
		this.updateEntityGroups();
	}

	@Input('chosen') set chosen(value: readonly number[]) {
		this.logger.debug('[discover] setting chosen', value);
		this._chosen = value;
	}

	trackByFn(index, item: Entity) {
		return item.id;
	}

	private updateEntityGroups() {
		if (!this._entities || !this._choices) {
			this.logger.debug('[discover] entities not initialized yet');
			return;
		}
		this.discoverCards = this._entities.toArray().filter(entity => this._choices.indexOf(entity.id) !== -1);
	}
}
