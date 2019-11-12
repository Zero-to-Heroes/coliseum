import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'overlay-ticked',
	styleUrls: ['../../../../css/components/game/card/overlay-ticked.component.scss'],
	template: `
		<img
			src="https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/mulligan_discard.png"
			class="overlay-ticked"
		/>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverlayTickedComponent {
	image: string;

	constructor(private logger: NGXLogger) {
		console.warn('missing discover pick icon');
	}
}
