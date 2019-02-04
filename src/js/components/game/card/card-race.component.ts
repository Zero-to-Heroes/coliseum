import { Component, ChangeDetectionStrategy, Input, HostListener, ElementRef, AfterViewInit, ChangeDetectorRef, ViewRef } from '@angular/core';
import { AllCardsService } from '../../../services/all-cards.service';

@Component({
	selector: 'card-race',
	styleUrls: [
		'../../../../css/global/text.scss',
		'../../../../css/components/game/card/card-race.component.scss',
	],
	template: `
        <div class="card-race" *ngIf="race">
            <img class="banner" src="https://static.zerotoheroes.com/hearthstone/asset/manastorm/card/race-banner.png" />
            <div class="text"><div>{{race}}</div></div>
        </div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardRaceComponent {

    race: string;

    constructor(private cards: AllCardsService, private elRef: ElementRef, private cdr: ChangeDetectorRef) { 
        this.cdr.detach();
        document.addEventListener(
            'card-resize',
            (event) => this.resizeText(),
            true);
    }

    @Input('cardId') set cardId(cardId: string) {
        this.race = undefined;
        console.log('[card-race] setting cardId', cardId);
        const originalCard = this.cards.getCard(cardId);
        if (!originalCard.race) {
            if (!(<ViewRef>this.cdr).destroyed) {
                this.cdr.detectChanges();
            }
            return;
        }
        this.race = originalCard.race.toLowerCase();
        // We need to detect the changes so that the component is rendered first (because 
        // of the *ngIf)
        if (!(<ViewRef>this.cdr).destroyed) {
            this.cdr.detectChanges();
        }
        setTimeout(() => this.resizeText());
    }

    // @HostListener('window:resize', ['$event'])
    // onResize(event) {
    //     this.resizeText();
    // }
    // @HostListener('card-resize', ['$event'])
    // onResize(event) {
    //     console.log('handling custom card-resize event', event);
    //     this.resizeText();
    // }

    private resizeText() {
        const el = this.elRef.nativeElement.querySelector(".card-race");
        if (!el) {
            setTimeout(() => this.resizeText());
            return; 
        }
        const fontSize = 0.3 * el.getBoundingClientRect().width;
        const textEl = this.elRef.nativeElement.querySelector(".card-race");
        textEl.style.fontSize = fontSize + 'px';
        if (!(<ViewRef>this.cdr).destroyed) {
            this.cdr.detectChanges();
        }
    }
}
