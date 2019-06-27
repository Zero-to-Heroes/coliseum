import { Directive, ElementRef, Input, ViewRef, ChangeDetectorRef } from '@angular/core';

@Directive({
  selector: '[cardElementResize]'
})
export class CardElementResizeDirective {

    @Input() fontSizeRatio: number;
    
    constructor(private elRef: ElementRef, private cdr: ChangeDetectorRef) {
        document.addEventListener(
            'card-resize',
            () => this.resizeText(),
            true);
    }

    ngAfterViewInit() {
        this.elRef.nativeElement.style.opacity = 0;
        setTimeout(() => this.resizeText());
    }

    private resizeText() {
        const el = this.elRef.nativeElement;
        if (!el) {
            setTimeout(() => this.resizeText());
            return; 
        }
        const fontSize = this.fontSizeRatio * el.getBoundingClientRect().width;
        const textEl = this.elRef.nativeElement.querySelector("[resizeTarget]");
        textEl.style.fontSize = fontSize + 'px';
        this.elRef.nativeElement.style.opacity = 1;
        if (!(<ViewRef>this.cdr).destroyed) {
            this.cdr.detectChanges();
        }
    }
}