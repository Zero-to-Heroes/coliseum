import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'weapon-art',
	styleUrls: ['../../../../css/components/game/hero/weapon-art.component.scss'],
	template: `
		<img src="{{ image }}" class="weapon-art" />
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeaponArtComponent {
	image: string;

	constructor(private logger: NGXLogger) {}

	@Input('cardId') set cardId(cardId: string) {
		this.logger.debug('[weapon-art] setting cardId', cardId);
		this.image = `https://static.zerotoheroes.com/hearthstone/cardart/256x/${cardId}.jpg`;
	}
}
