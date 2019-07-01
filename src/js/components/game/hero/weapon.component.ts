import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Entity } from '../../../models/game/entity';
import { NGXLogger } from 'ngx-logger';
import { GameTag } from '../../../models/enums/game-tags';

@Component({
	selector: 'weapon',
	styleUrls: [
        '../../../../css/components/game/hero/weapon.component.scss'
    ],
	template: `
        <div class="weapon" 
                cardTooltip [tooltipEntity]="weapon"
                [attr.data-entity-id]="entityId">
            <weapon-art [cardId]="cardId" *ngIf="!exhausted"></weapon-art>
            <weapon-frame [exhausted]="exhausted"></weapon-frame>
			<weapon-stats 
                    [cardId]="cardId" 
                    [attack]="attack"
					[durability]="durability"
					[damage]="damage">
            </weapon-stats>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeaponComponent {

    entityId: number;
    cardId: string;
    attack: number;
    durability: number;
    damage: number;
    exhausted: boolean;

    private _weapon: Entity;

    constructor(private logger: NGXLogger) {}

    @Input('weapon') set weapon(weapon: Entity) {
        if (!weapon) {
            return;
        }
        this.logger.debug('[weapon] setting new weapon', weapon, weapon.tags.toJS());
        this.entityId = weapon.id;
        this.cardId = weapon.cardID;
        this._weapon = weapon;
		this.attack = weapon.getTag(GameTag.ATK);
		this.durability = weapon.getTag(GameTag.DURABILITY);
		this.damage = weapon.getTag(GameTag.DAMAGE);
        this.exhausted = weapon.getTag(GameTag.EXHAUSTED) === 1;
    }
}
