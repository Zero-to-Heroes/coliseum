import { Component, ChangeDetectionStrategy, Input, HostListener, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
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
            <div class="text"><div>{{race}}</div></div>
        </div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardRaceComponent {

    race: string;

    constructor(private cards: AllCardsService, private elRef: ElementRef, private cdr: ChangeDetectorRef) { }

    @Input('cardId') set cardId(cardId: string) {
        this.race = undefined;
        console.log('[card-race] setting cardId', cardId);
        const originalCard = this.cards.getCard(cardId);
        if (!originalCard.race) {
            return;
        }
        this.race = originalCard.race.toLowerCase();
        setTimeout(() => this.resizeText());
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.resizeText();
    }

    private resizeText() {
        const el = this.elRef.nativeElement.querySelector(".card-race");
        const fontSize = 0.3 * el.getBoundingClientRect().width;
        const textEl = this.elRef.nativeElement.querySelector(".card-race");
        textEl.style.fontSize = fontSize + 'px';
        this.cdr.detectChanges();
    }
}
