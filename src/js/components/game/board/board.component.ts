import { Component, ChangeDetectionStrategy, NgZone, Input } from '@angular/core';
import { Entity } from '../../../models/game/entity';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'board',
	styleUrls: [
        '../../../../css/components/game/board/board.component.scss'
    ],
	template: `
		<ul class="board">
			<li *ngFor="let entity of _entities; trackBy: trackByFn">
				<card-on-board [entity]="entity"></card-on-board>
			</li>
		</ul>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardComponent {

	_entities: ReadonlyArray<Entity>;

	constructor(private logger: NGXLogger) { }

    @Input('entities') set entities(entities: ReadonlyArray<Entity>) {
        this.logger.debug('[board] setting new entities', entities);
		this._entities = entities;
	}
	
	trackByFn(index, item: Entity) {
		return item.id;
	}
}