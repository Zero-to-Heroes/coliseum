import { Component, ChangeDetectionStrategy, Input, ElementRef } from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { AllCardsService } from '../../../services/all-cards.service';

@Component({
	selector: 'card-text',
	styleUrls: [
		'../../../../css/global/text.scss',
		'../../../../css/components/game/card/card-text.component.scss'
	],
	template: `
        <div class="card-text" *ngIf="text">
            <div class="text" [fittext]="true" [minFontSize]="2" [activateOnResize]="true" [innerHTML]="text"></div>
        </div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardTextComponent {

    text: SafeHtml;
    maxFontSize: number;

    constructor(private cards: AllCardsService, private domSanitizer: DomSanitizer, private elRef: ElementRef) { }
    
    @Input('cardId') set cardId(cardId: string) {
        console.log('[card-text] setting cardId', cardId);
        this.text = undefined;
        const originalCard = this.cards.getCard(cardId);
        if (!originalCard.text) {
            return;
        }
        const description = originalCard.text
                .replace('\n', '<br/>')
                .replace(/\u00a0/g, " ")
                .replace(/^\[x\]/, "");
        this.text = this.domSanitizer.bypassSecurityTrustHtml(description);
    }
}
