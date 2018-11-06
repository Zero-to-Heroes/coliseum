import { Component, ChangeDetectionStrategy, NgZone, Input } from '@angular/core';
import { Map } from 'immutable';
import { Entity } from '../../../models/game/entity';
import { GameTag } from '../../../models/enums/game-tags';
import { Zone } from '../../../models/enums/zone';
import { CardType } from 'src/js/models/enums/card-type';

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
