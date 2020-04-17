import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CardType } from '@firestone-hs/reference-data';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'card-art',
	styleUrls: ['../../../../css/components/game/card/card-art.component.scss'],
	template: `
		<img src="{{ image }}" class="card-art {{ _cardType }}" />
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardArtComponent {
	image: string;
	_cardType: string;

	constructor(private logger: NGXLogger) {}

	@Input('cardId') set cardId(cardId: string) {
		this.logger.debug('[card-art] setting cardId', cardId);
		this.image = cardId
			? `https://static.zerotoheroes.com/hearthstone/cardart/256x/${cardId}.jpg`
			: `https://static.zerotoheroes.com/hearthstone/asset/manastorm/card_unknown.png`;
	}

	@Input('cardType') set cardType(cardType: CardType) {
		this.logger.debug('[card-art] setting cardType', cardType);
		this._cardType = cardType ? CardType[cardType]?.toLowerCase() : 'unknown';
	}
}
