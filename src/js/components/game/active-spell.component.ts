import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Entity } from '../../models/game/entity';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'active-spell',
	styleUrls: [
        '../../../css/components/game/active-spell.component.scss'
	],
	template: `
		<div class="active-spell">
            <card class="active-spell"
                    *ngIf="_entity"
                    [entity]="_entity">
            </card>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveSpellComponent {

	_entity: Entity;

	constructor(private logger: NGXLogger) {
	}

    @Input('entity') set entity(value: Entity) {
        this.logger.debug('[active-spell] setting new entity', value);
		this._entity = value;
	}
}