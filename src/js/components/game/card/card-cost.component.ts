import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewRef } from '@angular/core';
import { CardType } from '@firestone-hs/reference-data';
import { AllCardsService } from '@firestone-hs/replay-parser';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'card-cost',
	styleUrls: [
		'../../../../css/global/text.scss',
		'../../../../css/components/game/card/card-cost.component.scss',
		'../../../../css/components/game/card/card-cost-colors.scss',
	],
	template: `
		<div class="card-cost {{ costClass }} {{ _cardType }}" cardElementResize [fontSizeRatio]="fontSizeRatio">
			<img class="mana-icon" src="https://static.zerotoheroes.com/hearthstone/asset/manastorm/mana.png" />
			<div class="cost">
				<div resizeTarget>{{ _cost }}</div>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardCostComponent {
	_cost: number;
	costClass: string;
	_cardType: string;
	fontSizeRatio: number;

	private _cardId: string;

	constructor(private cards: AllCardsService, private logger: NGXLogger, private cdr: ChangeDetectorRef) {}

	@Input('cardId') set cardId(cardId: string) {
		this.logger.debug('[card-cost] setting cardId', cardId);
		this._cardId = cardId;
		this.updateCost();
	}

	@Input('cost') set cost(cost: number) {
		this.logger.debug('[card-cost] setting cost', cost);
		this._cost = cost;
		this.costClass = undefined;
		this.updateCost();
	}

	@Input('cardType') set cardType(cardType: CardType) {
		this.logger.debug('[card-text] setting cardType', cardType);
		this._cardType = CardType[cardType]?.toLowerCase();
		this.fontSizeRatio = this._cardType === CardType[CardType.HERO_POWER]?.toLowerCase() ? 0.6 : 0.8;
		this.updateCost();
	}

	private updateCost() {
		if (!this._cardId) {
			return;
		}
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
}
