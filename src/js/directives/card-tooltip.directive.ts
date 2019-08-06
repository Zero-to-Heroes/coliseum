import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { Events } from '../services/events.service';
import { Entity } from '../models/game/entity';

@Directive({
	selector: '[cardTooltip]',
})
export class CardTooltipDirective {
	@Input() tooltipEntity: Entity;
	@Input() tooltipControllerEntity: Entity;
	@Input() tooltipEnchantments: readonly Entity[];
	@Input() hasTooltip = true;

	constructor(private el: ElementRef, private events: Events) {}

	@HostListener('mouseenter')
	onMouseEnter() {
		if (!this.hasTooltip || !this.tooltipEntity.cardID) {
			return;
		}
		let x = 100;
		let y = 0;
		let element = this.el.nativeElement;
		while (element && !element.classList.contains('external-player')) {
			x += element.offsetLeft;
			y += element.offsetTop;
			element = element.offsetParent;
		}
		// TODO: compute this once at component init + after each resize, instead of every time
		// TODO: move the logic away to tooltips component, so it can take care of auto positioning
		this.events.broadcast(Events.SHOW_TOOLTIP, this.tooltipEntity, this.tooltipControllerEntity, x, y, this.tooltipEnchantments);
	}

	@HostListener('mouseleave')
	onMouseLeave() {
		this.events.broadcast(Events.HIDE_TOOLTIP, this.tooltipEntity);
	}
}
