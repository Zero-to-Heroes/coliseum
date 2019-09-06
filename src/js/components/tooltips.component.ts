import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ComponentFactoryResolver,
	ComponentRef,
	ElementRef,
	HostBinding,
	HostListener,
	Input,
	ViewChild,
	ViewContainerRef,
	ViewRef,
} from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Entity } from '../models/game/entity';
import { Events } from '../services/events.service';

// Also takes into account the borders + mana symbol
const CARD_ASPECT_RATIO = 1.56;

@Component({
	selector: 'tooltip',
	styleUrls: [`../../css/components/tooltip.component.scss`],
	template: `
		<card
			class="tooltip"
			[forbiddenTargetSource]="true"
			[enchantments]="enchantments"
			[entity]="entity"
			[controller]="controller"
			[hasTooltip]="false"
			*ngIf="entity"
		>
		</card>
	`,
	// I don't know how to make this work with OnPush
	// changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipComponent {
	@Input() entity: Entity;
	@Input() enchantments: readonly Entity[];
	@Input() controller: Entity;

	@HostBinding('style.left') left: string;
	@HostBinding('style.top') top: string;
	@HostBinding('style.position') position: string;
	@HostBinding('style.display') display: string;
}

@Component({
	selector: 'tooltips',
	styleUrls: [`../../css/components/tooltips.component.scss`],
	entryComponents: [TooltipComponent],
	template: `
		<div class="tooltips"><ng-template #tooltips></ng-template></div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipsComponent implements AfterViewInit {
	@ViewChild('tooltips', { read: ViewContainerRef, static: false }) tooltips: ViewContainerRef;
	private tooltip: ComponentRef<any>;

	private tooltipHeight: number = undefined;
	private tooltipWidth: number = undefined;
	private horizontalOffset: number = undefined;
	private tooltipSize: number = undefined;
	private rect;

	constructor(
		private events: Events,
		private logger: NGXLogger,
		private elRef: ElementRef,
		private cdr: ChangeDetectorRef,
		private resolver: ComponentFactoryResolver,
	) {
		this.events.on(Events.SHOW_TOOLTIP).subscribe(data => {
			this.destroy();
			this.logger.debug('[tooltips] showing tooltip', data, this.rect);
			if (!this.rect) {
				return;
			}
			const entity: Entity = data.data[0];
			const controller: Entity = data.data[1];

			const elementLeft = data.data[2];
			const elementTop = data.data[3];
			const elementWidth = data.data[4];
			const elementHeight = data.data[5];
			const enchantments = data.data[6];

			// First try to fit it at the right of the element
			let left = elementLeft + elementWidth + this.horizontalOffset;
			if (left + this.tooltipWidth > this.rect.right) {
				// Put it on the left then
				left = elementLeft - this.tooltipWidth - this.horizontalOffset;
				this.logger.debug(
					'[tooltips] doesnt fit on the right, putting it left',
					left,
					this.tooltipWidth,
					elementLeft,
					elementWidth,
					this.horizontalOffset,
				);
			}

			// First try to center the tooltip vs the element
			const elementCenter = elementTop + elementHeight / 2;
			let top = elementCenter - this.tooltipHeight / 2;
			this.logger.debug('[tooltips] first top computation', top, elementCenter, this.tooltipHeight, this.rect.height);
			if (top < 0) {
				top = 0;
			} else if (top + this.tooltipHeight > this.rect.height) {
				top = this.rect.height - this.tooltipHeight;
				this.logger.debug('[tooltips] would go over zone', top, this.tooltipHeight, this.rect.height);
			}

			this.logger.debug('[tooltips] will show tooltip', left, top);
			this.tooltip.instance.entity = entity;
			this.tooltip.instance.controller = controller;
			this.tooltip.instance.enchantments = enchantments;
			this.tooltip.instance.left = left + 'px';
			this.tooltip.instance.top = top + 'px';
			if (!(this.cdr as ViewRef).destroyed) {
				this.cdr.detectChanges();
			}
		});

		this.events.on(Events.HIDE_TOOLTIP).subscribe(data => {
			this.destroy();
		});
	}

	ngAfterViewInit() {
		setTimeout(() => {
			// We create a factory out of the component we want to create
			const factory = this.resolver.resolveComponentFactory(TooltipComponent);

			// We create the component using the factory and the injector
			this.tooltip = this.tooltips.createComponent(factory);
			if (!(this.cdr as ViewRef).destroyed) {
				this.cdr.detectChanges();
			}
			this.tooltip.instance.display = 'block';
			this.tooltip.instance.position = 'absolute';

			// Cache the variables
			setTimeout(() => this.initializeTooltipVariables());
		});
	}

	private initializeTooltipVariables() {
		// We do this only at initialization, since afterwards the % size
		// is replaced by a pixel size
		const tooltipElement = this.elRef.nativeElement.querySelector('tooltip');
		if (!tooltipElement) {
			setTimeout(() => this.initializeTooltipVariables(), 20);
			return;
		}
		const styles = getComputedStyle(tooltipElement);
		this.tooltipSize = parseInt(styles.width.split('%')[0]) * 0.01;
		this.logger.info('[tooltips] tooltip variables initialized', this.tooltipSize);
		this.cacheTooltipSize();
	}

	private cacheTooltipSize() {
		this.rect = this.elRef.nativeElement.getBoundingClientRect();
		const tooltipElement = this.elRef.nativeElement.querySelector('tooltip');
		if (!tooltipElement) {
			setTimeout(() => this.cacheTooltipSize(), 20);
			return;
		}
		const styles = getComputedStyle(tooltipElement);
		this.logger.debug('[tooltips] tooltip size', this.tooltipSize, styles.width, styles);
		this.tooltipWidth = this.rect.width * this.tooltipSize;
		this.tooltipHeight = this.tooltipWidth * CARD_ASPECT_RATIO;
		this.horizontalOffset = this.rect.width * 0.018;
		this.logger.info('[tooltips] cached tooltip info', this.tooltipWidth, this.tooltipHeight, this.horizontalOffset, this.rect);
	}

	@HostListener('window:resize', ['$event'])
	onResize(event) {
		this.logger.debug('[tooltips] starting resize');
		this.cacheTooltipSize();
	}

	private destroy() {
		if (this.tooltip) {
			this.tooltip.instance.entity = undefined;
			if (!(this.cdr as ViewRef).destroyed) {
				this.cdr.detectChanges();
			}
		}
	}
}
