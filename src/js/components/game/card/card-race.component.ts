import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { AllCardsService } from '../../../services/all-cards.service';

@Component({
	selector: 'card-race',
	styleUrls: [
		'../../../../css/global/text.scss',
		'../../../../css/components/game/card/card-race.component.scss',
	],
	template: `
        <div class="card-race" *ngIf="race">
            <img class="banner" src="http://static.zerotoheroes.com/hearthstone/asset/manastorm/card/race-banner.png" />
            <div class="text">{{race}}</div>
        </div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardRaceComponent {

    race: string;

    constructor(private cards: AllCardsService) { }

    @Input('cardId') set cardId(cardId: string) {
        this.race = undefined;
        console.log('[card-race] setting cardId', cardId);
        const originalCard = this.cards.getCard(cardId);
        if (!originalCard.race) {
            return;
        }
        this.race = originalCard.race;
    }
}
