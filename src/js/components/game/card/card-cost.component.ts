import { Component, ChangeDetectionStrategy, Input, AfterViewInit, HostListener, ElementRef, ChangeDetectorRef, ViewRef } from '@angular/core';
import { AllCardsService } from '../../../services/all-cards.service';
import { NGXLogger } from 'ngx-logger';
import { CardType } from '../../../models/enums/card-type';

@Component({
	selector: 'card-cost',
	styleUrls: [
		'../../../../css/global/text.scss',
		'../../../../css/components/game/card/card-cost.component.scss',
	],
	template: `
        <div class="card-cost {{costClass}} {{_cardType}}">
            <img class="mana-icon" src="https://static.zerotoheroes.com/hearthstone/asset/manastorm/mana.png" />
            <div class="cost">
                <div>{{_cost}}</div>
            </div>
        </div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardCostComponent {

    _cost: number;
    costClass: string;
    _cardType: string;
    
    private _cardId: string;

    constructor(
            private cards: AllCardsService, 
            private elRef: ElementRef, 
            private logger: NGXLogger,
            private cdr: ChangeDetectorRef) { 
        this.cdr.detach();
        document.addEventListener(
            'card-resize',
            (event) => this.resizeText(),
            true);
    }

    @Input('cardId') set cardId(cardId: string) {
        this.logger.debug('[card-cost] setting cardId', cardId);
        this._cardId = cardId;
        this.updateCost();
    }

    @Input('cost') set cost(cost: number) {
        this.logger.debug('[card-cost] setting cost', cost);
        this._cost = cost;
        this.updateCost();
    }
    
    @Input('cardType') set cardType(cardType: CardType) {
        this.logger.debug('[card-text] setting cardType', cardType);
        this._cardType = CardType[cardType].toLowerCase();
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
        if (!(<ViewRef>this.cdr).destroyed) {
            this.cdr.detectChanges();
        }
    }

    private resizeText() {
        const el = this.elRef.nativeElement.querySelector(".card-cost");
        if (!el) {
            setTimeout(() => this.resizeText());
            return; 
        }
        const fontSize = this._cardType === CardType[CardType.HERO_POWER].toLowerCase()
                ? 0.6 * el.getBoundingClientRect().width
                : 0.8 * el.getBoundingClientRect().width;
        const textEl = this.elRef.nativeElement.querySelector(".cost");
        textEl.style.fontSize = fontSize + 'px';
        if (!(<ViewRef>this.cdr).destroyed) {
            this.cdr.detectChanges();
        }
    }
}
