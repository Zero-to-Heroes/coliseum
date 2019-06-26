import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Entity } from '../../../models/game/entity';
import { GameTag } from '../../../models/enums/game-tags';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'hero-power',
	styleUrls: [
        '../../../../css/components/game/hero/hero-power.component.scss'
    ],
	template: `
        <div class="hero-power" 
                cardTooltip [tooltipEntity]="entity"
                [attr.data-entity-id]="entityId">
            <hero-power-art [cardId]="cardId"></hero-power-art>
            <hero-power-frame></hero-power-frame>
			<hero-power-cost [cardId]="cardId" [cost]="cost"></hero-power-cost>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroPowerComponent {

    entity: Entity;
    entityId: number;
    cardId: string;
    cost: number;
    
    constructor(private logger: NGXLogger) {}

    @Input('heroPower') set heroPower(heroPower: Entity) {
        this.logger.debug('[hero-power] setting new heroPower', heroPower);
        this.entity = heroPower;
        this.entityId = heroPower.id;
        this.cardId = heroPower.cardID;
		this.cost = heroPower.getTag(GameTag.COST);
    }
}
