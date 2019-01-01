import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'hero-frame',
	styleUrls: [
		'../../../../css/components/game/hero/hero-frame.component.scss'
	],
	template: `
        <img src="https://static.zerotoheroes.com/hearthstone/asset/manastorm/hero_frame.png" class="hero-frame" />
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroFrameComponent {
}
