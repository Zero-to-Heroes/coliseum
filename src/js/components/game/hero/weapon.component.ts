import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Entity } from '../../../models/game/entity';

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

    @Input('weapon') set weapon(weapon: Entity) {
        console.log('[weapon] setting new weapon', weapon);
        this._weapon = weapon;
    }
}
