import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
	selector: 'hero-power-art',
	styleUrls: [
		'../../../../css/components/game/hero/hero-power-art.component.scss'
	],
	template: `
        <img src="{{image}}" class="hero-power-art" />
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroPowerArtComponent {

	image: string;

    @Input('cardId') set cardId(cardId: string) {
        console.log('[hero-power-art] setting cardId', cardId);
        this.image = `http://static.zerotoheroes.com/hearthstone/cardart/256x/${cardId}.jpg`;
	}
}
