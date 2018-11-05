import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Entity } from '../../models/game/entity';

@Component({
	selector: 'hand',
	styleUrls: [
        '../../../css/components/game/hand.component.scss'
	],
	template: `
		<ul class="hand">
			<li *ngFor="let entity of _entities; trackBy: trackByFn">
				<card [entity]="entity"></card>
			</li>
		</ul>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HandComponent {

	_entities: ReadonlyArray<Entity>;

    @Input('entities') set entities(entities: ReadonlyArray<Entity>) {
        console.log('[hand] setting new entities', entities);
		this._entities = entities;
	}
	
	trackByFn(index, item: Entity) {
		return item.id;
	}
}
