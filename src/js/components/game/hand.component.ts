import { Component, ChangeDetectionStrategy, Input, AfterViewInit, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Entity } from '../../models/game/entity';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'hand',
	styleUrls: [
        '../../../css/components/game/hand.component.scss'
	],
	template: `
		<ul class="hand">
			<li *ngFor="let entity of _entities; let i = index; trackBy: trackByFn" 
					[style.marginLeft.%]="i !== 0 ? marginLeft : 0">
				<card [entity]="entity" [option]="isOption(entity)" [controller]="_controller"></card>
			</li>
		</ul>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HandComponent {

    _entities: ReadonlyArray<Entity>;
    _options: ReadonlyArray<number>;
    _controller: Entity;
	marginLeft: number;

	constructor(private logger: NGXLogger) {
	}

    @Input('entities') set entities(entities: ReadonlyArray<Entity>) {
        this.logger.debug('[hand] setting new entities', entities);
		this._entities = entities;
		switch (entities.length) {
			case 7:
				this.marginLeft = -2;
				return;
			case 8:
				this.marginLeft = -2.5;
				return;
			case 9:
				this.marginLeft = -3;
				return;
			case 10:
				this.marginLeft = -3.5;
				return;
			default:
				this.marginLeft = -1;
		}
    }

    @Input('options') set options(value: ReadonlyArray<number>) {
        this.logger.debug('[hand] setting options', value);
        this._options = value;
    }
    
    @Input('controller') set controller(value: Entity) {
		this.logger.debug('[hand] setting controller', value);
        this._controller = value;
    }

    isOption(entity: Entity): boolean {
        return this._options.indexOf(entity.id) !== -1;
    }
	
	trackByFn(index, item: Entity) {
		return item.id;
	}
}
