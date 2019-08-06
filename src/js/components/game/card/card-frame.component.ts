import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { AllCardsService } from '../../../services/all-cards.service';
import { CardClass } from '../../../models/enums/card-class';
import { CardType } from '../../../models/enums/card-type';
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
		const cardType: CardType = CardType[originalCard.type.toUpperCase() as string];
		const frame: string = this.buildFrame(cardClass, cardType, this._premium);
		this.image = `https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/card/${frame}.png`;
	}

	private buildPlayerClass(originalCard): CardClass {
		const cardClass: CardClass = CardClass[originalCard.playerClass.toUpperCase() as string];
		// Ysera
		return cardClass === CardClass.DREAM ? CardClass.HUNTER : cardClass;
	}

	private buildFrame(cardClass: CardClass, cardType: CardType, premium: boolean): string {
		const strType = '-' + CardType[cardType].toLowerCase();
		const strClass = cardType === CardType.HERO_POWER ? '' : premium ? '-premium' : '-' + CardClass[cardClass].toLowerCase();
		return `frame${strType}${strClass}`;
	}
}
