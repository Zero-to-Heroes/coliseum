import { Component, ChangeDetectionStrategy, Input, ElementRef, ChangeDetectorRef, ViewRef, HostListener } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Entity } from '../../../models/game/entity';

@Component({
	selector: 'deck',
	styleUrls: [
		'../../../../css/global/text.scss',
		'../../../../css/components/game/deck/deck.component.scss',
	],
	template: `
        <div class="deck">
            <img class="cardback-icon" src="https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/cardback.png" />
            <div class="count">
                <div class="text">{{numberOfCards}}</div>
            </div>
        </div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeckComponent {

    _deck: ReadonlyArray<Entity>;
    numberOfCards: number;

    constructor(private logger: NGXLogger, private elRef: ElementRef, private cdr: ChangeDetectorRef) {  }

    @Input('deck') set deck(value: ReadonlyArray<Entity>) {
        this.logger.debug('[deck] setting deck', value);
        this._deck = value;
        this.numberOfCards = this._deck.length;
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.resizeText();
    }

    ngAfterViewInit() {
        setTimeout(() => this.resizeText());
    }

    private resizeText() {
        const el = this.elRef.nativeElement.querySelector(".deck");
        if (!el) {
            setTimeout(() => this.resizeText());
            return; 
        }
        const fontSize = 0.5 * el.getBoundingClientRect().width;
        const textEl = this.elRef.nativeElement.querySelector(".count");
        textEl.style.fontSize = fontSize + 'px';
        if (!(<ViewRef>this.cdr).destroyed) {
            this.cdr.detectChanges();
        }
    }
}
