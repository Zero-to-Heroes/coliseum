import { Directive, ElementRef, HostListener, ViewRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';

@Directive({
  selector: '[cardResize]'
})
export class CardResizeDirective implements AfterViewInit {
    
    constructor(private el: ElementRef, private cdr: ChangeDetectorRef) {

    }

	ngAfterViewInit() {
        // We use opacity to avoid flickering
        this.el.nativeElement.style.opacity = 0;
		setTimeout(() => this.resize());
	}

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.resize();
    }

	private resize() {
        const el = this.el.nativeElement;
        const width = 120.0 / 187 * el.getBoundingClientRect().height;
		const textEl = this.el.nativeElement;
		textEl.style.width = width + 'px';
        if (!(<ViewRef>this.cdr).destroyed) {
            this.cdr.detectChanges();
        }
		setTimeout(() => {
            el.dispatchEvent(new Event('card-resize', { bubbles: false }));
            setTimeout(() => {
                this.el.nativeElement.style.opacity = 1;
                if (!(<ViewRef>this.cdr).destroyed) {
                    this.cdr.detectChanges();
                }
            });
		});
	}
}