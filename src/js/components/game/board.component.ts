import { Component, ChangeDetectionStrategy, NgZone, Input } from '@angular/core';
import { Map } from 'immutable';
import { Entity } from '../../models/game/entity';
import { GameTag } from '../../models/enums/game-tags';
import { Zone } from '../../models/enums/zone';

@Component({
	selector: 'board',
	styleUrls: [
        '../../../css/components/game/board.component.scss'
    ],
	template: `
        <div class="board">
            <hand [entities]="handEntities"></hand>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardComponent {

    _entities: Map<number, Entity>;
    _playerId: number;

    handEntities: ReadonlyArray<Entity>;

    @Input('entities') set entities(entities: Map<number, Entity>) {
        console.log('[board] setting new entities', entities.toJS());
        this._entities = entities;
        this.updateEntityGroups();
    }

    @Input('playerId') set playerId(playerId: number) {
        console.log('[board] setting playerId', playerId);
        this._playerId = playerId;
        this.updateEntityGroups();
    }

    private updateEntityGroups() {
        if (!this._entities || ! this._playerId) {
            console.log('[board] entities not initialized yet');
            return;
        }
        
        this.handEntities = this.getHandEntities(this._playerId);
        console.log('[board] hand entities updated', this.handEntities);
    }

    private getHandEntities(playerId: number): ReadonlyArray<Entity> {
        return this._entities.toArray()
                .filter((entity) => entity.getTag(GameTag.CONTROLLER) == playerId)
                .filter((entity) => entity.getTag(GameTag.ZONE) == Zone.HAND)
                .sort((a, b) => a.getTag(GameTag.ZONE_POSITION) - b.getTag(GameTag.ZONE_POSITION));
    }

}
