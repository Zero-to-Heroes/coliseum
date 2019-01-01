import { Component, ChangeDetectionStrategy, NgZone, Input } from '@angular/core';
import { Entity } from '../../../models/game/entity';

@Component({
	selector: 'board',
	styleUrls: [
        '../../../../css/components/game/board/board.component.scss'
    ],
	template: `
		<ul class="board">
			<li *ngFor="let entity of _entities; trackBy: trackByFn">
				<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">
				<card-on-board [entity]="entity"></card-on-board>
			</li>
		</ul>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardComponent {

	_entities: ReadonlyArray<Entity>;

    @Input('entities') set entities(entities: ReadonlyArray<Entity>) {
        console.log('[board] setting new entities', entities);
		this._entities = entities;
	}
	
	trackByFn(index, item: Entity) {
		return item.id;
	}
}
