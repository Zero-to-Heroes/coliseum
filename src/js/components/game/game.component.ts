import { Component, ChangeDetectionStrategy, NgZone, Input } from '@angular/core';
import { Map } from 'immutable';
import { Entity } from '../../models/entity';
import { GameTag } from '../../models/enums/game-tags';
import { Zone } from '../../models/enums/zone';

@Component({
	selector: 'game',
	styleUrls: [],
	template: `
		<div>
            Opponent: <hand [entities]="opponentHandEntities"></hand>
            Player: <hand [entities]="playerHandEntities"></hand>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent {

    _entities: Map<number, Entity>;
    _playerId: number;
    _opponentId: number;

    opponentHandEntities: ReadonlyArray<Entity>;
    playerHandEntities: ReadonlyArray<Entity>;

    @Input('entities') set entities(entities: Map<number, Entity>) {
        console.log('[game] setting new entities', entities.toJS());
        this._entities = entities;
        this.updateEntityGroups();
    }

    @Input('playerId') set playerId(playerId: number) {
        console.log('[game] setting playerId', playerId);
        this._playerId = playerId;
        this.updateEntityGroups();
    }

    @Input('opponentId') set opponentId(opponentId: number) {
        console.log('[game] setting opponentId', opponentId);
        this._opponentId = opponentId;
        this.updateEntityGroups();
    }

    private updateEntityGroups() {
        if (!this._entities || ! this._playerId || !this._opponentId) {
            console.log('[game] entities not initialized yet');
            return;
        }
        
        // Opponent hand entities
        this.opponentHandEntities = this.getHandEntities(this._opponentId);
        this.playerHandEntities = this.getHandEntities(this._playerId);
        console.log('[game] hand entities updated', this.opponentHandEntities, this.playerHandEntities);
    }

    private getHandEntities(playerId: number): ReadonlyArray<Entity> {
        return this._entities.toArray()
                .filter((entity) => entity.getTag(GameTag.CONTROLLER) == playerId)
                .filter((entity) => entity.getTag(GameTag.ZONE) == Zone.HAND)
                .sort((a, b) => a.getTag(GameTag.ZONE_POSITION) - b.getTag(GameTag.ZONE_POSITION));
    }

}
