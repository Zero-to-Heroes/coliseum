import { Component, ChangeDetectionStrategy, Input, ViewEncapsulation, AfterViewInit, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { CardType } from '../../../models/enums/card-type';
import { AllCardsService } from '../../../services/all-cards.service';

@Component({
	selector: 'card-name',
	styleUrls: [
		'../../../../css/global/text.scss',
		'../../../../css/components/game/card/card-name.component.scss',
	],
	template: `
        <div class="card-name">
            <img src="{{banner}}" class="banner" />
            <div class="text" [innerHTML]="textSvg"></div>
        </div>
	`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardNameComponent {

    banner: string;
    textSvg: SafeHtml;
    
    constructor(
        private cards: AllCardsService, 
        private domSanitizer: DomSanitizer, 
        private elRef: ElementRef) { 

    }

    @Input('cardId') set cardId(cardId: string) {
        console.log('[card-name] setting cardId', cardId);
        const originalCard = this.cards.getCard(cardId);
        const cardType: CardType = CardType[originalCard.type.toUpperCase() as string];
        this.banner = `http://static.zerotoheroes.com/hearthstone/asset/manastorm/card/name-banner-${CardType[cardType].toLowerCase()}.png`;
		this.textSvg = this.domSanitizer.bypassSecurityTrustHtml(this.buildNameSvg(cardType, originalCard.name));
        setTimeout(() => this.resizeText());
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.resizeText();
    }

    private buildNameSvg(cardType: CardType, name: string): string {
        const pathId: string = `${CardType[cardType].toLowerCase()}Path`;
        const path: string = this.buildPath(cardType, pathId);
        return `
            <svg x="0" y ="0" viewBox="0 0 1000 200" id="svg">
                <defs>${path}</defs>
                <text id="svgText">
                    <textPath startOffset="50%" href="#${pathId}">${name}</textPath>
                </text>
            </svg>`;
    }

    private buildPath(cardType: CardType, pathId: string): string {
        switch (cardType) {
            case CardType.MINION:
                return `<path id=${pathId} d="M 0,130 C 30,140 100,140 180,125 M 180,125 C 250,110 750,-15 1000,100" />`;
            case CardType.SPELL:
                return `<path id=${pathId} d="M 0,140 Q 500,-23 1000,154" />`;
            case CardType.WEAPON:
                return `<path id=${pathId} d="M 0,50 H 1000" />`;
            case CardType.HERO_POWER:
                return `<path id=${pathId} d="M 0,50 H 1000" />`;
            case CardType.HERO:
                return `<path id=${pathId} d="M 0,180 Q 500,-63 1000,180" />`;
        }
    }

    private resizeText() {
        const svgEl = this.elRef.nativeElement.querySelector("#svg");
        const fontSize = 1.15 * svgEl.getBoundingClientRect().width;
        const textEl = this.elRef.nativeElement.querySelector("#svgText");
        textEl.setAttribute('font-size', fontSize);
    }
}
