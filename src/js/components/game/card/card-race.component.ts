import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'card-race',
	styleUrls: [
		'../../../../css/global/text.scss',
		'../../../../css/components/game/card/card-race.component.scss',
	],
	template: `
        <div class="card-race" cardElementResize [fontSizeRatio]="0.3">
            <img class="banner" src="https://static.zerotoheroes.com/hearthstone/asset/manastorm/card/race-banner.png" />
            <div class="text" resizeTarget><div>{{_race}}</div></div>
        </div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardRaceComponent {

    _race: string;

    constructor(private logger: NGXLogger, private cdr: ChangeDetectorRef) { }

    @Input('race') set race(value: string) {
        this.logger.debug('[card-race] setting race', value);
        this._race = value;
    }
}
