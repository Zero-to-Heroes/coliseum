import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Map } from 'immutable';
import { Entity } from '../../models/game/entity';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'game',
	styleUrls: [
        '../../../css/components/game/game.component.scss'
    ],
	template: `
        <div class="game">
            <play-area class="top" [entities]="_entities" [playerId]="_opponentId"></play-area>
            <play-area class="bottom" [entities]="_entities" [playerId]="_playerId"></play-area>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent {

    _entities: Map<number, Entity>;
    _playerId: number;
    _opponentId: number;

    constructor(private logger: NGXLogger) { } 

    @Input('entities') set entities(entities: Map<number, Entity>) {
        this.logger.debug('[game] setting new entities', entities.toJS());
        this._entities = entities;
    }

    @Input('playerId') set playerId(playerId: number) {
        this.logger.debug('[game] setting playerId', playerId);
        this._playerId = playerId;
    }

    @Input('opponentId') set opponentId(opponentId: number) {
        this.logger.debug('[game] setting opponentId', opponentId);
        this._opponentId = opponentId;
    }

}
