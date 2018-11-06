import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { AllCardsService } from '../../../services/all-cards.service';
import { CardRarity } from '../../../models/enums/card-rarity';

@Component({
	selector: 'card-rarity',
	styleUrls: [
		'../../../../css/components/game/card/card-rarity.component.scss'
	],
	template: `
        <img *ngIf="image" src="{{image}}" class="card-rarity" />
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardRarityComponent {

    image: string;

    constructor(private cards: AllCardsService) { }

    @Input('cardId') set cardId(cardId: string) {
        console.log('[card-rarity] setting cardId', cardId);
        this.image = undefined;
        const originalCard = this.cards.getCard(cardId);
        const cardRarity: CardRarity = this.buildRarity(originalCard);
        if (!cardRarity || cardRarity === CardRarity.FREE) {
            return;
        }
        this.image = `http://static.zerotoheroes.com/hearthstone/asset/manastorm/card/rarity-${CardRarity[cardRarity].toLowerCase()}.png`;
    }

    private buildRarity(originalCard): CardRarity {
        if (!originalCard.rarity) {
            return undefined;
        }
        return CardRarity[originalCard.rarity.toUpperCase() as string];
    }
}