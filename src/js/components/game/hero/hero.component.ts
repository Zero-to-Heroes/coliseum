import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Entity } from '../../../models/game/entity';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'hero',
	styleUrls: [
        '../../../../css/components/game/hero/hero.component.scss'
    ],
	template: `
        <div class="hero">
            <weapon [weapon]="_weapon"></weapon>
            <hero-card [hero]="_hero"></hero-card>
            <hero-power [heroPower]="_heroPower"></hero-power>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent {

    _hero: Entity;
    _heroPower: Entity;
    _weapon: Entity;

    constructor(private logger: NGXLogger) {}

    @Input('hero') set hero(hero: Entity) {
        this.logger.debug('[hero] setting new entity', hero);
        this._hero = hero;
    }

    @Input('heroPower') set heroPower(heroPower: Entity) {
        this.logger.debug('[hero] setting new heroPower', heroPower);
        this._heroPower = heroPower;
    }

    @Input('weapon') set weapon(weapon: Entity) {
        this.logger.debug('[hero] setting new weapon', weapon);
        this._weapon = weapon;
    }
}
