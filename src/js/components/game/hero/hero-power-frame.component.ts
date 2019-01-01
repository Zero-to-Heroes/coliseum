import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { AllCardsService } from '../../../services/all-cards.service';

@Component({
	selector: 'hero-power-frame',
	styleUrls: [
		'../../../../css/components/game/hero/hero-power-frame.component.scss'
	],
	template: `
        <img src="https://static.zerotoheroes.com/hearthstone/asset/manastorm/hero_power.png" class="hero-power-frame" />
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroPowerFrameComponent {
}
