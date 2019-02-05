import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CardType } from '../../../models/enums/card-type';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'card-art',
	styleUrls: [
		'../../../../css/components/game/card/card-art.component.scss'
	],
	template: `
        <img src="{{image}}" class="card-art {{_cardType}}" />
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardArtComponent {

	image: string;
	_cardType: string;

	constructor(private logger: NGXLogger) { }

    @Input('cardId') set cardId(cardId: string) {
        this.logger.debug('[card-art] setting cardId', cardId);
        this.image = `https://static.zerotoheroes.com/hearthstone/cardart/256x/${cardId}.jpg`;
	}
	
    @Input('cardType') set cardType(cardType: CardType) {
        this.logger.debug('[card-art] setting cardType', cardType);
        this._cardType = CardType[cardType].toLowerCase();
    }
}
