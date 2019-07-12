import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Entity } from '../../../models/game/entity';
import { NGXLogger } from 'ngx-logger';
import { Map } from 'immutable';

@Component({
	selector: 'burn',
	styleUrls: [
        '../../../../css/components/game/overlay/burn.component.scss'
    ],
	template: `
        <div class="burn">
            <li *ngFor="let entity of burnedCards; let i = index; trackBy: trackByFn">
                <card [entity]="entity" [hasTooltip]="false" [crossed]="true"></card>
            </li>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BurnComponent {

    _entities: Map<number, Entity>;
    _burned: ReadonlyArray<number>;

    burnedCards: ReadonlyArray<Entity>
    
    constructor(private logger: NGXLogger) {}

    @Input('entities') set entities(entities: Map<number, Entity>) {
        this.logger.debug('[burn] setting new entities', entities.toJS());
        this._entities = entities;
        this.updateEntityGroups();
    }

    @Input('burned') set burned(value: ReadonlyArray<number>) {
        this.logger.debug('[burn] setting burned', value);
        this._burned = value;
        this.updateEntityGroups();
    }
	
	trackByFn(index, item: Entity) {
		return item.id;
	}

    private updateEntityGroups() {
        if (!this._entities || !this._burned) {
            this.logger.debug('[burn] entities not initialized yet');
            return;
        }
        this.burnedCards = this._entities.toArray()
                .filter(entity => this._burned.indexOf(entity.id) !== -1);
    }
}
