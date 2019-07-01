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
            <weapon [weapon]="_weapon" *ngIf="_weapon"></weapon>
            <hero-card [hero]="_hero" [option]="isOption(_hero)"></hero-card>
            <hero-power [heroPower]="_heroPower" [option]="isOption(_heroPower)"></hero-power>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent {

    _hero: Entity;
    _heroPower: Entity;
    _weapon: Entity;
    _options: ReadonlyArray<number>;

    constructor(private logger: NGXLogger) {}

    @Input('hero') set hero(hero: Entity) {
        this.logger.debug('[hero] setting hero', hero, hero.tags.toJS());
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

    @Input('options') set options(value: ReadonlyArray<number>) {
        this.logger.debug('[hero] setting options', value);
        this._options = value;
    }

    isOption(entity: Entity): boolean {
        return this._options.indexOf(entity.id) !== -1;
    }
}
