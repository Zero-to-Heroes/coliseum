import { Component, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, Input, HostBinding, ViewChild, ViewContainerRef, ComponentFactoryResolver, AfterViewInit, ViewRef } from '@angular/core';
import { Entity } from '../models/game/entity';
import { Events } from '../services/events.service';
import { ViewEncapsulation } from '@angular/compiler/src/core';


@Component({
	selector: 'tooltip',
  	styleUrls: [`../../css/components/tooltip.component.scss`],
  	encapsulation: ViewEncapsulation.None,
	template: `<card class="tooltip" [entity]="entity" [hasTooltip]="false" *ngIf="entity"></card>`,
  	// I don't know how to make this work with OnPush
  	// changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tooltip {
  	@Input() entity: Tooltip;

  	@HostBinding('style.left') left: string;
  	@HostBinding('style.top') top: string;
  	@HostBinding('style.position') position: string;
  	@HostBinding('style.display') display: string;
}

@Component({
	selector: 'tooltips',
	styleUrls: [`../../css/components/tooltips.component.scss`],
	entryComponents: [Tooltip],
	encapsulation: ViewEncapsulation.None,
	template: `
		<div class="tooltips"><ng-template #tooltips></ng-template></div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipsComponent implements AfterViewInit {

    @ViewChild('tooltips', { read: ViewContainerRef }) tooltips: ViewContainerRef;
    private tooltip;

	constructor(
		private events: Events,
		private elRef: ElementRef,
		private cdr: ChangeDetectorRef,
		private resolver: ComponentFactoryResolver) {

		this.events.on(Events.SHOW_TOOLTIP).subscribe(
			(data) => {
				// let start = Date.now();
				this.destroy();
				const entity: Entity = data.data[0];
				const left = data.data[1];
				const top = data.data[2];

			    this.tooltip.instance.display = 'block';
			    this.tooltip.instance.entity = entity;
			    this.tooltip.instance.left = left + 'px';
			    this.tooltip.instance.top = top + 'px';
			    this.tooltip.instance.position = 'absolute';
				if (!(<ViewRef>this.cdr).destroyed) {
					this.cdr.detectChanges();
				}
			}
		);

		this.events.on(Events.HIDE_TOOLTIP).subscribe(
			(data) => {
				this.destroy();
			}
		);
	}

	ngAfterViewInit() {
		this.cdr.detach();
		// https://blog.angularindepth.com/everything-you-need-to-know-about-the-expressionchangedafterithasbeencheckederror-error-e3fd9ce7dbb4
		setTimeout(() => {
		    // We create a factory out of the component we want to create
		    let factory = this.resolver.resolveComponentFactory(Tooltip);

		    // We create the component using the factory and the injector
		    this.tooltip = this.tooltips.createComponent(factory);
		})
	}

	private destroy() {
		if (this.tooltip) {
			this.tooltip.instance.entity = undefined;
			if (!(<ViewRef>this.cdr).destroyed) {
				this.cdr.detectChanges();
			}
		}
	}
}
