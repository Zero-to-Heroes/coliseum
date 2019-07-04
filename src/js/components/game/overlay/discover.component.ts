import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Entity } from '../../../models/game/entity';
import { NGXLogger } from 'ngx-logger';
import { Map } from 'immutable';

@Component({
	selector: 'discover',
	styleUrls: [
        '../../../../css/components/game/overlay/discover.component.scss'
    ],
	template: `
        <div class="discover">
            <li *ngFor="let entity of discoverCards; let i = index; trackBy: trackByFn">
                <card [entity]="entity" [hasTooltip]="false"></card>
            </li>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscoverComponent {

    _entities: Map<number, Entity>;
    _choices: ReadonlyArray<number>;

    discoverCards: ReadonlyArray<Entity>
    
    constructor(private logger: NGXLogger) {}

    @Input('entities') set entities(entities: Map<number, Entity>) {
        this.logger.debug('[discover] setting new entities', entities.toJS());
        this._entities = entities;
        this.updateEntityGroups();
    }

    @Input('choices') set choices(value: ReadonlyArray<number>) {
        this.logger.debug('[discover] setting choices', value);
        this._choices = value;
        this.updateEntityGroups();
    }
	
	trackByFn(index, item: Entity) {
		return item.id;
	}

    private updateEntityGroups() {
        if (!this._entities || !this._choices) {
            this.logger.debug('[discover] entities not initialized yet');
            return;
        }
        this.discoverCards = this._entities.toArray()
                .filter(entity => this._choices.indexOf(entity.id) !== -1);
        console.log('set discoverCards', this.discoverCards, this._choices);
    }
}