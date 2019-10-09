import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AllCardsService } from '@firestone-hs/replay-parser';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'weapon-stats',
	styleUrls: [
		'../../../../css/global/text.scss',
		'../../../../css/components/game/hero/weapon-stats.component.scss',
		'../../../../css/components/game/card/card-stats-colors.scss',
	],
	template: `
		<div class="weapon-stats" cardElementResize [fontSizeRatio]="0.15">
			<div class="stat {{ attackClass }}" resizeTarget>
				<div class="stat-value">
					<span>{{ _attack }}</span>
				</div>
			</div>
			<div class="stat {{ durabilityClass }}" resizeTarget>
				<div class="stat-value">
					<span>{{ durabilityLeft }}</span>
				</div>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeaponStatsComponent {
	attackClass: string;
	durabilityClass: string;

	durabilityLeft: number;
	_attack: number;

	private _cardId: string;
	private _durability: number;
	private _damage: number;

	constructor(private cards: AllCardsService, private logger: NGXLogger) {}

	@Input('cardId') set cardId(cardId: string) {
		this.logger.debug('[weapon-stats] setting cardId', cardId);
		this._cardId = cardId;
		this.updateStats();
	}

	@Input('attack') set attack(attack: number) {
		this.logger.debug('[weapon-stats] setting attack', attack);
		this._attack = attack;
		this.updateStats();
	}

	@Input('durability') set durability(value: number) {
		this.logger.debug('[weapon-stats] setting health', value);
		this._durability = value;
		this.updateStats();
	}

	@Input('damage') set damage(damage: number) {
		this.logger.debug('[weapon-stats] setting damage', damage);
		this._damage = damage;
		this.updateStats();
	}

	private updateStats() {
		this.attackClass = undefined;
		this.durabilityClass = undefined;

		if (!this._cardId) {
			return;
		}
		const originalCard = this.cards.getCard(this._cardId);

		if (this._attack == null) {
			this._attack = originalCard.attack;
		}
		if (this._durability == null) {
			this._durability = originalCard.durability;
		}
		if (this._damage == null) {
			this._damage = 0;
		}

		this.durabilityLeft = this._durability - this._damage;
		this.updateAttackClass(originalCard);
		this.updateDurabilityClass(originalCard);
	}

	private updateAttackClass(originalCard) {
		this.attackClass = 'attack';
		if (this._attack > originalCard.attack) {
			this.attackClass += ' buff';
		} else if (this._attack < originalCard.attack) {
			this.attackClass += ' debuff';
		}
	}

	private updateDurabilityClass(originalCard) {
		this.durabilityClass = 'durability';
		if (this._damage > 0) {
			this.durabilityClass += ' damaged';
		}
	}
}
