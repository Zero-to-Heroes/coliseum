import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Entity } from '../../../models/game/entity';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'weapon',
	styleUrls: [
        '../../../../css/components/game/hero/weapon.component.scss'
    ],
	template: `
        <div class="weapon">
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeaponComponent {

    private _weapon: Entity;

    constructor(private logger: NGXLogger) {}

    @Input('weapon') set weapon(weapon: Entity) {
        this.logger.debug('[weapon] setting new weapon', weapon);
        this._weapon = weapon;
    }
}
