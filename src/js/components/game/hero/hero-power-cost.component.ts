import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	HostListener,
	Input,
	ViewRef,
} from '@angular/core';
import { AllCardsService } from '@firestone-hs/replay-parser';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'hero-power-cost',
	styleUrls: [
		'../../../../css/global/text.scss',
		'../../../../css/components/game/hero/hero-power-cost.component.scss',
		'../../../../css/components/game/card/card-cost-colors.scss',
	],
	template: `
		<div class="hero-power-cost {{ costClass }}" [ngClass]="{ 'premium': _premium }">
			<div class="cost">{{ _cost }}</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroPowerCostComponent implements AfterViewInit {
	_cost: number;
	costClass: string;
	_premium: boolean;

	private _cardId: string;

	constructor(
		private cards: AllCardsService,
		private elRef: ElementRef,
		private logger: NGXLogger,
		private cdr: ChangeDetectorRef,
	) {}

	@Input('cardId') set cardId(cardId: string) {
		this.logger.debug('[hero-power-cost] setting cardId', cardId);
		this._cardId = cardId;
		this.updateCost();
	}

	@Input('cost') set cost(cost: number) {
		this.logger.debug('[hero-power-cost] setting cost', cost);
		this._cost = cost;
		this.updateCost();
	}

	@Input('premium') set premium(premium: boolean) {
		this.logger.debug('[hero-power-cost] setting premium', premium);
		this._premium = premium || undefined;
	}

	@HostListener('window:resize', ['$event'])
	onResize(event) {
		this.resizeText();
	}

	ngAfterViewInit() {
		setTimeout(() => this.resizeText());
	}

	private updateCost() {
		if (!this._cardId) {
			return;
		}
		this.costClass = undefined;
		const originalCard = this.cards.getCard(this._cardId);
		const originalCost: number = originalCard.cost;

		if (this._cost == null) {
			this._cost = originalCost;
		}

		if (this._cost < originalCost) {
			this.costClass = 'lower-cost';
		} else if (this._cost > originalCost) {
			this.costClass = 'higher-cost';
		}
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}

	private resizeText() {
		try {
			const el = this.elRef.nativeElement.querySelector('.hero-power-cost');
			if (!el) {
				setTimeout(() => this.resizeText());
				return;
			}
			const fontSize = 0.8 * el.getBoundingClientRect().width;
			const textEl = this.elRef.nativeElement.querySelector('.cost');
			textEl.style.fontSize = fontSize + 'px';
			if (!(this.cdr as ViewRef).destroyed) {
				this.cdr.detectChanges();
			}
		} catch (e) {
			console.error('[hero-power-cost] Exception in resizeText', e);
		}
	}
}
