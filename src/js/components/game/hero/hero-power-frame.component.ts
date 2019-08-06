import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'hero-power-frame',
	styleUrls: ['../../../../css/components/game/hero/hero-power-frame.component.scss'],
	template: `
		<img src="{{ image }}" class="hero-power-frame" [ngClass]="{ 'premium': _premium }" />
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroPowerFrameComponent {
	image: string;
	_premium = false;

	private _exhausted = false;

	constructor(private logger: NGXLogger) {}

	@Input('exhausted') set exhausted(value: boolean) {
		this.logger.debug('[hero-power-frame] setting exhausted', value);
		this._exhausted = value;
		this.updateImage();
	}

	@Input('premium') set premium(premium: boolean) {
		this.logger.debug('[hero-power-frame] setting premium', premium);
		this._premium = premium || undefined;
		this.updateImage();
	}

	private updateImage() {
		const frame = this._exhausted ? `hero_power_exhausted` : `hero_power`;
		const premium = this._premium ? '_premium' : '';
		this.image = `https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/hero/${frame}${premium}.png`;
	}
}
