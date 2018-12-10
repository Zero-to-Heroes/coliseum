import { Component, ChangeDetectionStrategy, Input, AfterViewInit, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';
import { AllCardsService } from '../../../services/all-cards.service';

@Component({
	selector: 'hero-power-cost',
	styleUrls: [
		'../../../../css/global/text.scss',
		'../../../../css/components/game/hero/hero-power-cost.component.scss',
	],
	template: `
        <div class="hero-power-cost {{costClass}}">
            <div class="cost">{{_cost}}</div>
        </div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroPowerCostComponent implements AfterViewInit {

    _cost: number;
    costClass: string;
    
    private _cardId: string;

    constructor(private cards: AllCardsService, private elRef: ElementRef, private cdr: ChangeDetectorRef) { 
        this.cdr.detach();
    }

    @Input('cardId') set cardId(cardId: string) {
        console.log('[hero-power-cost] setting cardId', cardId);
        this._cardId = cardId;
        this.updateCost();
    }

    @Input('cost') set cost(cost: number) {
        console.log('[hero-power-cost] setting cost', cost);
        this._cost = cost;
        this.updateCost();
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.resizeText();
    }

    ngAfterViewInit() {
        setTimeout(() => this.resizeText());
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
        this.cdr.detectChanges();
    }

    private resizeText() {
        const el = this.elRef.nativeElement.querySelector(".hero-power-cost");
        const fontSize = 0.8 * el.getBoundingClientRect().width;
        const textEl = this.elRef.nativeElement.querySelector(".cost");
        textEl.style.fontSize = fontSize + 'px';
        this.cdr.detectChanges();
    }
}
