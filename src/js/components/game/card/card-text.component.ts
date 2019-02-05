import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, ViewRef } from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { AllCardsService } from '../../../services/all-cards.service';
import { CardType } from '../../../models/enums/card-type';

@Component({
	selector: 'card-text',
	styleUrls: [
		'../../../../css/global/text.scss',
		'../../../../css/components/game/card/card-text.component.scss'
	],
	template: `
        <div class="card-text {{_cardType}}" *ngIf="text">
            <div class="text" 
                    [fittext]="true" 
                    [minFontSize]="2" 
                    [useMaxFontSize]="true" 
                    [activateOnResize]="false"
                    [modelToWatch]="dirtyFlag"
                    [innerHTML]="text"></div>
        </div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardTextComponent {

	_cardType: string;
    text: SafeHtml;
    maxFontSize: number;
    dirtyFlag: boolean = false;

    constructor(
        private cards: AllCardsService, 
        private domSanitizer: DomSanitizer,
        private cdr: ChangeDetectorRef) {
            document.addEventListener(
                'card-resize',
                (event) => this.resizeText(),
                true);
        }
    
    @Input('cardId') set cardId(cardId: string) {
        console.log('[card-text] setting cardId', cardId);
        this.text = undefined;
        const originalCard = this.cards.getCard(cardId);
        if (!originalCard.text) {
            if (!(<ViewRef>this.cdr).destroyed) {
                this.cdr.detectChanges();
            }
            return;
        }
        const description = originalCard.text
                .replace('\n', '<br/>')
                .replace(/\u00a0/g, " ")
                .replace(/^\[x\]/, "");
        this.text = this.domSanitizer.bypassSecurityTrustHtml(description);
        if (!(<ViewRef>this.cdr).destroyed) {
            this.cdr.detectChanges();
        }
    }
	
    @Input('cardType') set cardType(cardType: CardType) {
        console.log('[card-text] setting cardType', cardType);
        this._cardType = CardType[cardType].toLowerCase();
    }

    private resizeText() {
        this.dirtyFlag = !this.dirtyFlag;
        if (!(<ViewRef>this.cdr).destroyed) {
            this.cdr.detectChanges();
        }
    }
}
