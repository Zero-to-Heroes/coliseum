import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

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

    @Input('cardId') set cardId(cardId: string) {
        console.log('[hero-art] setting cardId', cardId);
        this.image = `http://static.zerotoheroes.com/hearthstone/cardart/256x/${cardId}.jpg`;
	}
}
