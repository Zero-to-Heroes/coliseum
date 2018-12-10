import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { AllCardsService } from '../../../services/all-cards.service';

@Component({
	selector: 'card-cost',
	styleUrls: [
		'../../../../css/components/game/card/card-cost.component.scss'
	],
	template: `
        <div class="card-cost {{costClass}}">
            <img class="mana-icon" src="http://static.zerotoheroes.com/hearthstone/asset/manastorm/mana.png" />
            <div class="cost">
                <div [fittext]="true" [minFontSize]="2" [activateOnResize]="true">{{_cost}}</div>
            </div>
        </div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardCostComponent {

    _cost: number;
    costClass: string;
    
    private _cardId: string;

    constructor(private cards: AllCardsService) { }

    @Input('cardId') set cardId(cardId: string) {
        console.log('[card-cost] setting cardId', cardId);
        this._cardId = cardId;
        this.updateCost();
    }

    @Input('cost') set cost(cost: number) {
        console.log('[card-cost] setting cost', cost);
        this._cost = cost;
        this.updateCost();
    }

    private updateCost() {
        if (!this._cardId) {
            return;
        }
        const originalCard = this.cards.getCard(this._cardId);
        const originalCost: number = originalCard.cost;
        
        if (this._cost == null) {
            this._cost = originalCost;
        }

        if (this._cost < originalCost) {
            this.costClass = 'lower-cost';
        }
        else if (this._cost > originalCost) {
            this.costClass = 'higher-cost';
        }
    }
}
