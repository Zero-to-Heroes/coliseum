import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Entity } from '../../../models/game/entity';
import { GameTag } from '../../../models/enums/game-tags';

@Component({
	selector: 'hero-power',
	styleUrls: [
        '../../../../css/components/game/hero/hero-power.component.scss'
    ],
	template: `
        <div class="hero-power">
            <hero-power-art [cardId]="cardId"></hero-power-art>
            <hero-power-frame></hero-power-frame>
			<hero-power-cost [cardId]="cardId" [cost]="cost"></hero-power-cost>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroPowerComponent {

    cardId: string;
	cost: number;

    @Input('heroPower') set heroPower(heroPower: Entity) {
        console.log('[hero-power] setting new heroPower', heroPower);
        this.cardId = heroPower.cardID;
		this.cost = heroPower.getTag(GameTag.COST);
    }
}
