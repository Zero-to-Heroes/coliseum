import { Component, ChangeDetectionStrategy, Input, ElementRef, ChangeDetectorRef, ViewRef } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { playerName } from '../../../../assets/svg/player_name';

@Component({
	selector: 'player-name',
	styleUrls: [
        '../../../../css/components/game/overlay/player-name.component.scss'
    ],
	template: `
        <div class="player-name" [ngClass]="{'active': _active}">
            <div class="background" [innerHTML]="svg"></div>
            <div class="text"><span>{{_name}}</span></div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerNameComponent {

    _name: string;
    _active: boolean;
    svg: SafeHtml;
    
    constructor(
            private logger: NGXLogger, 
            private domSanitizer: DomSanitizer, 
            private cdr: ChangeDetectorRef,
            private elRef: ElementRef) {
        this.svg = this.domSanitizer.bypassSecurityTrustHtml(playerName);
        document.addEventListener(
            'card-resize',
            (event) => this.resizeText(),
            true);
    }

    @Input('name') set name(value: string) {
        this.logger.debug('[player-name] setting player name', value);
        this._name = value;
    }

    @Input('active') set active(value: boolean) {
        this.logger.debug('[player-name] setting player active', value);
        this._active = value;
    }

    private resizeText() {
        const el = this.elRef.nativeElement.querySelector(".player-name");
        if (!el) {
            setTimeout(() => this.resizeText());
            return; 
        }
        console.log('found element to resize player name', el);
        const fontSize = 0.17 * el.getBoundingClientRect().height;
        const textEl = this.elRef.nativeElement.querySelector(".text");
        console.log('fontsize', fontSize, el.getBoundingClientRect());
        textEl.style.fontSize = fontSize + 'px';
        if (!(<ViewRef>this.cdr).destroyed) {
            this.cdr.detectChanges();
        }
    }
}
