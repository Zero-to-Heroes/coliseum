import { Component, ChangeDetectionStrategy, Input, ElementRef, ChangeDetectorRef, ViewRef, AfterViewInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'damage',
	styleUrls: [
		'../../../../css/global/text.scss',
		'../../../../css/components/game/card/damage.component.scss',
	],
	template: `
        <div class="damage">
            <img class="damage-icon" src="https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/icon_damage.png" />
            <div class="amount">
                <div>-{{_amount}}</div>
            </div>
        </div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DamageComponent implements AfterViewInit {

    _amount: number;

    constructor(
            private elRef: ElementRef, 
            private logger: NGXLogger,
            private cdr: ChangeDetectorRef) { 
        document.addEventListener(
            'card-resize',
            (event) => this.resizeText(),
            true);
    }

    ngAfterViewInit() {
        this.elRef.nativeElement.style.opacity = 0;
        setTimeout(() => this.resizeText());
    }

    @Input('amount') set amount(value: number) {
        this.logger.debug('[damage] setting amount', value);
        this._amount = value;
    }

    private resizeText() {
        const el = this.elRef.nativeElement.querySelector(".damage");
        if (!el) {
            setTimeout(() => this.resizeText());
            return; 
        }
        const fontSize = 0.3 * el.getBoundingClientRect().width;
        const textEl = this.elRef.nativeElement.querySelector(".amount");
        textEl.style.fontSize = fontSize + 'px';
        this.elRef.nativeElement.style.opacity = 1;
        if (!(<ViewRef>this.cdr).destroyed) {
            this.cdr.detectChanges();
        }
    }
}
