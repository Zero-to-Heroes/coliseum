import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AllCardsService, Entity } from '@firestone-hs/replay-parser';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'card-enchantment',
	styleUrls: [
		'../../../../css/global/text.scss',
		'../../../../css/components/game/card/card-enchantment.component.scss',
	],
	template: `
		<div class="card-enchantment" cardElementResize [fontSizeRatio]="0.1">
			<div class="name" resizeTarget>{{ name }}</div>
			<div class="body">
				<div class="image">
					<img class="art" src="{{ art }}" />
					<img class="ring" src="{{ ringImage }}" />
				</div>
				<div class="description" resizeTarget [innerHTML]="description"></div>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardEnchantmentComponent {
	_enchantment: Entity;
	name: string;
	art: string;
	description: string;
	ringImage = 'https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/enchantments/enchantment-ring.png';

	constructor(private logger: NGXLogger, private cards: AllCardsService) {}

	@Input('enchantment') set enchantment(value: Entity) {
		this.logger.debug('[card-enchantment] setting enchantment', value);
		this._enchantment = value;
		const cardId = value.cardID;
		const card = this.cards.getCard(cardId);
		if (!card) {
			return;
		}
		this.name = card.name;
		this.art = `https://static.zerotoheroes.com/hearthstone/cardart/256x/${cardId}.jpg`;
		this.description = card.text;
	}
}
