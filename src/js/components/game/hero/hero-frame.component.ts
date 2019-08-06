import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'hero-frame',
	styleUrls: ['../../../../css/components/game/hero/hero-frame.component.scss'],
	template: `
		<img src="{{ image }}" class="hero-frame" />
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroFrameComponent {
	image: string;
	_premium = false;

	constructor(private logger: NGXLogger) {}

	@Input('premium') set premium(premium: boolean) {
		this.logger.debug('[hero-frame] setting premium', premium);
		this._premium = premium || undefined;
		const premiumSuffix = premium ? '_premium' : '';
		this.image = `https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/hero/hero_frame${premiumSuffix}.png`;
	}
}
