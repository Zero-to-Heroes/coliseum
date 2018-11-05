import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Map } from 'immutable';
import { Entity } from '../../models/game/entity';

@Component({
	selector: 'game',
	styleUrls: [
        '../../../css/components/game/game.component.scss'
    ],
	template: `
        <div class="game">
            <board class="top" [entities]="_entities" [playerId]="_opponentId"></board>
            <board class="bottom" [entities]="_entities" [playerId]="_playerId"></board>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent {

    _entities: Map<number, Entity>;
    _playerId: number;
    _opponentId: number;

    @Input('entities') set entities(entities: Map<number, Entity>) {
        console.log('[game] setting new entities', entities.toJS());
        this._entities = entities;
    }

    @Input('playerId') set playerId(playerId: number) {
        console.log('[game] setting playerId', playerId);
        this._playerId = playerId;
    }

    @Input('opponentId') set opponentId(opponentId: number) {
        console.log('[game] setting opponentId', opponentId);
        this._opponentId = opponentId;
    }

}
