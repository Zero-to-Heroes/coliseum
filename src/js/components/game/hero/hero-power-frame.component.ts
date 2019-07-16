import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'hero-power-frame',
	styleUrls: [
		'../../../../css/components/game/hero/hero-power-frame.component.scss'
	],
	template: `
        <img src="{{image}}" class="hero-power-frame" />
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroPowerFrameComponent {

	image: string;

	constructor(private logger: NGXLogger) { }

	@Input('exhausted') set exhausted(value: boolean) {
		this.logger.debug('[hero-power-frame] setting exhausted', value);
		this.image = value
				? `https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/hero_power_exhausted.png`
				: `https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/hero_power.png`;
	}
}
