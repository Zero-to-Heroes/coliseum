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
            <hero-power-art [cardId]="cardId" *ngIf="!exhausted"></hero-power-art>
            <hero-power-frame [exhausted]="exhausted"></hero-power-frame>
			<hero-power-cost [cardId]="cardId" [cost]="cost" *ngIf="!exhausted"></hero-power-cost>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroPowerComponent {

    entity: Entity;
    entityId: number;
    cardId: string;
    cost: number;
    exhausted: boolean;
    
    constructor(private logger: NGXLogger) {}

    @Input('heroPower') set heroPower(heroPower: Entity) {
        this.logger.debug('[hero-power] setting new heroPower', heroPower, heroPower.tags.toJS());
        this.entity = heroPower;
        this.entityId = heroPower.id;
        this.cardId = heroPower.cardID;
        this.exhausted = heroPower.getTag(GameTag.EXHAUSTED) === 1 || heroPower.getTag(GameTag.HERO_POWER_DISABLED) === 1;
		this.cost = heroPower.getTag(GameTag.COST);
    }
}
