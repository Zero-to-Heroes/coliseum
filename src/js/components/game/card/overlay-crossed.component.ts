import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AllCardsService } from '../../../services/all-cards.service';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'overlay-crossed',
	styleUrls: ['../../../../css/components/game/card/overlay-crossed.component.scss'],
	template: `
		<img src="https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/mulligan_discard.png" class="overlay-crossed" />
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverlayCrossedComponent {
	image: string;

	constructor(private cards: AllCardsService, private logger: NGXLogger) {}
}
