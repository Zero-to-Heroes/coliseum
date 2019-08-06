import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'hero-power-art',
	styleUrls: ['../../../../css/components/game/hero/hero-power-art.component.scss'],
	template: `
		<img src="{{ image }}" class="hero-power-art" />
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroPowerArtComponent {
	image: string;

	constructor(private logger: NGXLogger) {}

	@Input('cardId') set cardId(cardId: string) {
		this.logger.debug('[hero-power-art] setting cardId', cardId);
		this.image = `https://static.zerotoheroes.com/hearthstone/cardart/256x/${cardId}.jpg`;
	}
}
