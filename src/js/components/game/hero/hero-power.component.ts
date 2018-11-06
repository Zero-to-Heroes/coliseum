import { Component, ChangeDetectionStrategy, NgZone, Input } from '@angular/core';
import { Map } from 'immutable';
import { Entity } from '../../../models/game/entity';
import { GameTag } from '../../../models/enums/game-tags';
import { Zone } from '../../../models/enums/zone';
import { CardType } from 'src/js/models/enums/card-type';

@Component({
	selector: 'hero-power',
	styleUrls: [
        '../../../../css/components/game/hero/hero-power.component.scss'
    ],
	template: `
        <div class="hero-power">
            <hero-power-art [cardId]="cardId"></hero-power-art>
            <hero-power-frame></hero-power-frame>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroPowerComponent {

    cardId: string;

    @Input('heroPower') set heroPower(heroPower: Entity) {
        console.log('[hero-power] setting new heroPower', heroPower);
        this.cardId = heroPower.cardID;
    }
}
