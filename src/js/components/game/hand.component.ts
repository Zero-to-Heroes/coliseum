import { Component, ChangeDetectionStrategy, NgZone, Input } from '@angular/core';
import { Map } from 'immutable';
import { Entity } from '../../models/game/entity';
import { GameTag } from '../../models/enums/game-tags';
import { Zone } from '../../models/enums/zone';

@Component({
	selector: 'hand',
	styleUrls: [],
	template: `
		<div>
            {{ debug }}
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HandComponent {

	_entities: ReadonlyArray<Entity>;
	debug;

    @Input('entities') set entities(entities: ReadonlyArray<Entity>) {
        console.log('[hand] setting new entities', entities);
		this._entities = entities;
		this.debug = this._entities.map((e) => e.cardID);
    }
}
