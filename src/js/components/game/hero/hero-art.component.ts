import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'hero-art',
	styleUrls: [
		'../../../../css/components/game/hero/hero-art.component.scss'
	],
	template: `
        <img src="{{image}}" class="hero-art" />
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroArtComponent {

	image: string;

	constructor(private logger: NGXLogger) { }

	@Input('cardId') set cardId(cardId: string) {
		this.logger.debug('[hero-art] setting cardId', cardId);
		this.image = `https://static.zerotoheroes.com/hearthstone/cardart/256x/${cardId}.jpg`;
	}
}
