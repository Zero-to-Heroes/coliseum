import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CardClass, CardType } from '@firestone-hs/reference-data';
import { AllCardsService } from '@firestone-hs/replay-parser';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'card-frame',
	styleUrls: ['../../../../css/components/game/card/card-frame.component.scss'],
	template: `
		<img src="{{ image }}" class="card-frame" />
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardFrameComponent {
	image: string;

	private _cardId: string;
	private _premium: boolean = undefined;

	constructor(private cards: AllCardsService, private logger: NGXLogger) {}

	@Input('cardId') set cardId(cardId: string) {
		this.logger.debug('[card-frame] setting cardId', cardId);
		this._cardId = cardId;
		this.updateImage();
	}

	@Input('premium') set premium(premium: boolean) {
		this.logger.debug('[card-frame] setting premium', premium);
		this._premium = premium || undefined;
		this.updateImage();
	}

	private updateImage() {
		if (!this._cardId) {
			return;
		}
		const originalCard = this.cards.getCard(this._cardId);
		const cardClass: CardClass = this.buildPlayerClass(originalCard);
		const cardType: CardType =
			originalCard && originalCard.type ? CardType[originalCard.type.toUpperCase() as string] : undefined;
		const frame: string = this.buildFrame(cardClass, cardType, this._premium);
		this.image = `https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/card/${frame}.png`;
	}

	private buildPlayerClass(originalCard): CardClass {
		const cardClass: CardClass =
			originalCard && originalCard.playerClass
				? CardClass[originalCard.playerClass.toUpperCase() as string]
				: CardClass.NEUTRAL;
		// Ysera
		return cardClass === CardClass.DREAM ? CardClass.HUNTER : cardClass;
	}

	private buildFrame(cardClass: CardClass, cardType: CardType, premium: boolean): string {
		const strClass =
			cardType === CardType.HERO_POWER ? '' : premium ? '-premium' : '-' + CardClass[cardClass].toLowerCase();
		const strFrame = CardType[cardType] ? CardType[cardType].toLowerCase() : 'nuetral';
		return `frame-${strFrame}${strClass}`;
	}
}
