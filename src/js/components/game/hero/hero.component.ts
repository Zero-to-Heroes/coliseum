import { Component, ChangeDetectionStrategy, NgZone, Input } from '@angular/core';
import { Map } from 'immutable';
import { Entity } from '../../../models/game/entity';
import { GameTag } from '../../../models/enums/game-tags';
import { Zone } from '../../../models/enums/zone';
import { CardType } from 'src/js/models/enums/card-type';

@Component({
	selector: 'hero',
	styleUrls: [
        '../../../../css/components/game/hero/hero.component.scss'
    ],
	template: `
        <div class="hero">

		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent {

    private _hero: Entity;
    private _heroPower: Entity;
    private _weapon: Entity;

    @Input('hero') set hero(hero: Entity) {
        console.log('[hero] setting new entity', hero);
        this._hero = hero;
    }

    @Input('heroPower') set heroPower(heroPower: Entity) {
        console.log('[hero] setting new heroPower', heroPower);
        this._heroPower = heroPower;
    }

    @Input('weapon') set weapon(weapon: Entity) {
        console.log('[hero] setting new weapon', weapon);
        this._weapon = weapon;
    }
}
