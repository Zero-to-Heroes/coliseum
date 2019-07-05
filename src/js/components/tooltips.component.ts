import { Component, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, Input, HostBinding, ViewChild, ViewContainerRef, ComponentFactoryResolver, AfterViewInit, ViewRef, ComponentRef } from '@angular/core';
import { Entity } from '../models/game/entity';
import { Events } from '../services/events.service';
import { ViewEncapsulation } from '@angular/compiler/src/core';

const CARD_ASPECT_RATIO = 1.56;

@Component({
	selector: 'tooltip',
  	styleUrls: [`../../css/components/tooltip.component.scss`],
  	encapsulation: ViewEncapsulation.None,
    template: `
    <card class="tooltip" 
            [forbiddenTargetSource]="true"
            [entity]="entity" 
            [controller]="controller"
            [hasTooltip]="false" *ngIf="entity">
    </card>`,
  	// I don't know how to make this work with OnPush
  	// changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tooltip {
  	@Input() entity: Entity;
  	@Input() controller: Entity;

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
    private tooltip: ComponentRef<any>;

    private tooltipHeight: number = undefined;
    private tooltipWidth: number = undefined;
    private rect;

	constructor(
		private events: Events,
		private elRef: ElementRef,
		private cdr: ChangeDetectorRef,
		private resolver: ComponentFactoryResolver) {

		this.events.on(Events.SHOW_TOOLTIP).subscribe(
			(data) => {
                this.destroy();
                if (!this.rect) {
                    return;
                }
                const entity: Entity = data.data[0];
                const controller: Entity = data.data[1];
                
				const leftInput = data.data[2];
                const topInput = data.data[3];
                
                const left = leftInput < this.rect.left
                        ? this.rect.left
                        : (leftInput + this.tooltipWidth > this.rect.right 
                                ? this.rect.right - this.tooltipWidth
                                : leftInput);
                const top = topInput < this.rect.top
                        ? this.rect.top
                        : (topInput + this.tooltipHeight > this.rect.bottom
                                ? this.rect.bottom - this.tooltipHeight
                                : topInput);

			    this.tooltip.instance.entity = entity;
			    this.tooltip.instance.controller = controller;
			    this.tooltip.instance.left = left + 'px';
			    this.tooltip.instance.top = top + 'px';
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
		// https://blog.angularindepth.com/everything-you-need-to-know-about-the-expressionchangedafterithasbeencheckederror-error-e3fd9ce7dbb4
		setTimeout(() => {
		    // We create a factory out of the component we want to create
		    let factory = this.resolver.resolveComponentFactory(Tooltip);

		    // We create the component using the factory and the injector
            this.tooltip = this.tooltips.createComponent(factory);
            if (!(<ViewRef>this.cdr).destroyed) {
                this.cdr.detectChanges();
            }
            this.tooltip.instance.display = 'block';
            this.tooltip.instance.position = 'absolute';
            
            // Cache the variables
            setTimeout(() => {
                this.cacheTooltipSize();
            });
		})
    }

    // TODO: handle resize
    private cacheTooltipSize() {
        this.rect = this.elRef.nativeElement.getBoundingClientRect();
        
        const tooltipElement = this.elRef.nativeElement.querySelector('tooltip');
        const styles = getComputedStyle(tooltipElement);
        const tooltipSize = parseInt(styles.width.split('%')[0]) * 0.01;
        this.tooltipWidth = this.rect.width * tooltipSize;
        this.tooltipHeight = this.tooltipWidth * CARD_ASPECT_RATIO;
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
