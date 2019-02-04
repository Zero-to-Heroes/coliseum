import { Component, ChangeDetectionStrategy, Input, AfterViewInit, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';
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
export class HandComponent implements AfterViewInit {

	_entities: ReadonlyArray<Entity>;

	constructor(private elRef: ElementRef, private cdr: ChangeDetectorRef) {
		// this.cdr.detach();
	}

    @Input('entities') set entities(entities: ReadonlyArray<Entity>) {
        console.log('[hand] setting new entities', entities);
		this._entities = entities;
	}
	
	trackByFn(index, item: Entity) {
		return item.id;
	}

    ngAfterViewInit() {
		// To trigger the resizing of all text elements
		// setTimeout(() => {
		// 	console.log('resizing');
		// 	window.dispatchEvent(new Event('resize'));
		// });
	}
}
