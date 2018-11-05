import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CardType } from '../../../models/enums/card-type';

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

    @Input('cardId') set cardId(cardId: string) {
        console.log('[card-art] setting cardId', cardId);
        this.image = `http://static.zerotoheroes.com/hearthstone/cardart/256x/${cardId}.jpg`;
	}
	
    @Input('cardType') set cardType(cardType: CardType) {
        console.log('[card-art] setting cardType', cardType);
        this._cardType = CardType[cardType].toLowerCase();
    }
}
