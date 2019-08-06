import { Directive, ElementRef, Input, ViewRef, ChangeDetectorRef, AfterViewInit } from '@angular/core';

@Directive({
	selector: '[cardElementResize]',
})
export class CardElementResizeDirective implements AfterViewInit {
	@Input() fontSizeRatio: number;
	@Input() timeout = 0;
	@Input() keepOpacity = false;

	constructor(private elRef: ElementRef, private cdr: ChangeDetectorRef) {
		document.addEventListener('card-resize', () => this.resizeText(), true);
	}

	ngAfterViewInit() {
		this.elRef.nativeElement.style.opacity = 0;
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
		setTimeout(() => this.resizeText(), this.timeout);
	}

	private resizeText() {
		const el = this.elRef.nativeElement;
		if (!el) {
			setTimeout(() => this.resizeText());
			return;
		}
		const fontSize = this.fontSizeRatio * el.getBoundingClientRect().width;
		const textEls = this.elRef.nativeElement.querySelectorAll('[resizeTarget]');
		for (const textEl of textEls) {
			textEl.style.fontSize = fontSize + 'px';
			if (!this.keepOpacity) {
				this.elRef.nativeElement.style.opacity = 1;
			} else {
				this.elRef.nativeElement.style.removeProperty('opacity');
			}
			if (!(this.cdr as ViewRef).destroyed) {
				this.cdr.detectChanges();
			}
		}
	}
}
