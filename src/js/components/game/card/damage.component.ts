import { Component, ChangeDetectionStrategy, Input, ElementRef, ChangeDetectorRef } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'damage',
	styleUrls: ['../../../../css/global/text.scss', '../../../../css/components/game/card/damage.component.scss'],
	template: `
		<div class="damage" cardElementResize [fontSizeRatio]="0.3">
			<img class="damage-icon" src="{{ image }}" />
			<div class="amount" resizeTarget>
				<div>{{ prefix }}{{ _amount }}</div>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DamageComponent {
	image: string;
	prefix: string;
	_amount: number;

	constructor(private elRef: ElementRef, private logger: NGXLogger, private cdr: ChangeDetectorRef) {}

	@Input('amount') set amount(value: number) {
		this.logger.debug('[damage] setting amount', value);
		this._amount = Math.abs(value);
		if (value >= 0) {
			this.prefix = '-';
			this.image = 'https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/icon_damage.png';
		} else {
			this.prefix = '+';
			this.image = 'https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/icon_heal.png';
		}
	}
}
