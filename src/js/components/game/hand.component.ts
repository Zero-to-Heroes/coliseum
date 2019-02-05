import { Component, ChangeDetectionStrategy, Input, AfterViewInit, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Entity } from '../../models/game/entity';

@Component({
	selector: 'hand',
	styleUrls: [
        '../../../css/components/game/hand.component.scss'
	],
	template: `
		<ul class="hand">
			<li *ngFor="let entity of _entities; let i = index; trackBy: trackByFn" 
					[style.marginLeft.%]="i !== 0 ? marginLeft : 0">
				<card [entity]="entity"></card>
			</li>
		</ul>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HandComponent {

	_entities: ReadonlyArray<Entity>;
	marginLeft: number;

	constructor(private elRef: ElementRef, private cdr: ChangeDetectorRef) {
		// this.cdr.detach();
	}

    @Input('entities') set entities(entities: ReadonlyArray<Entity>) {
        console.log('[hand] setting new entities', entities);
		this._entities = entities;
		switch (entities.length) {
			case 7:
				this.marginLeft = -3;
				return;
			case 8:
				this.marginLeft = -5;
				return;
			case 9:
				this.marginLeft = -7;
				return;
			case 10:
				this.marginLeft = -9;
				return;
			default:
				this.marginLeft = -1;
		}
	}
	
	trackByFn(index, item: Entity) {
		return item.id;
	}
}
