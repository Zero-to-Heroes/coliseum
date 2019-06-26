import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Entity } from '../../../models/game/entity';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'weapon',
	styleUrls: [
        '../../../../css/components/game/hero/weapon.component.scss'
    ],
	template: `
        <div class="weapon" [attr.data-entity-id]="entityId">
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeaponComponent {

    entityId: number;

    private _weapon: Entity;

    constructor(private logger: NGXLogger) {}

    @Input('weapon') set weapon(weapon: Entity) {
        if (!weapon) {
            return;
        }
        this.logger.debug('[weapon] setting new weapon', weapon);
        this.entityId = weapon.id;
        this._weapon = weapon;
    }
}
