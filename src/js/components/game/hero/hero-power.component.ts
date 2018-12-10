import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Entity } from '../../../models/game/entity';

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
