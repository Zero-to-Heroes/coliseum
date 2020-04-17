import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AllCardsService } from '@firestone-hs/replay-parser';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'hero-stats',
	styleUrls: ['../../../../css/global/text.scss', '../../../../css/components/game/hero/hero-stats.component.scss'],
	template: `
		<div class="hero-stats" *ngIf="hasStats" cardElementResize [fontSizeRatio]="0.15">
			<div class="stat {{ attackClass }}" [style.opacity]="_attack ? 1 : 0" resizeTarget>
				<img
					class="stat-icon"
					src="https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/attack.png"
				/>
				<div class="stat-value">
					<span>{{ _attack }}</span>
				</div>
			</div>
			<div class="stat {{ healthClass }}" resizeTarget>
				<div class="stat-value">
					<span>{{ healthLeft }}</span>
				</div>
			</div>
			<div class="stat armor" resizeTarget *ngIf="_armor">
				<img
					class="stat-icon"
					src="https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/armor.png"
				/>
				<div class="stat-value">
					<span>{{ _armor }}</span>
				</div>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroStatsComponent {
	hasStats: boolean;

	attackClass: string;
	healthClass: string;

	healthLeft: number;
	_attack: number;
	_armor: number;

	private _cardId: string;
	private _health: number;
	private _damage: number;

	constructor(private cards: AllCardsService, private logger: NGXLogger) {}

	@Input('cardId') set cardId(cardId: string) {
		this.logger.debug('[card-stats] setting cardId', cardId);
		this._cardId = cardId;
		this.updateStats();
	}

	@Input('attack') set attack(attack: number) {
		this.logger.debug('[card-stats] setting attack', attack);
		this._attack = attack;
		this.updateStats();
	}

	@Input('health') set health(health: number) {
		this.logger.debug('[card-stats] setting health', health);
		this._health = health;
		this.updateStats();
	}

	@Input('damage') set damage(damage: number) {
		this.logger.debug('[card-stats] setting damage', damage);
		this._damage = damage;
		this.updateStats();
	}

	@Input('armor') set armor(armor: number) {
		this.logger.debug('[card-stats] setting armor', armor);
		this._armor = armor;
		this.updateStats();
	}

	private updateStats() {
		this.attackClass = undefined;
		this.healthClass = undefined;
		this.hasStats = undefined;

		if (!this._cardId) {
			return;
		}
		const originalCard = this.cards.getCard(this._cardId);

		if (this._attack == null) {
			this._attack = originalCard.attack;
		}
		if (this._health == null) {
			this._health = originalCard.health;
		}
		if (this._damage == null) {
			this._damage = 0;
		}
		if (this._armor == null) {
			this._armor = originalCard.armor;
		}
		this.hasStats =
			originalCard.attack > 0 || originalCard.health > 0 || originalCard.durability > 0 || originalCard.armor > 0;

		this.healthLeft = this._health - this._damage;
		this.updateAttackClass(originalCard);
		this.updateHealthClass(originalCard);
	}

	private updateAttackClass(originalCard) {
		this.attackClass = 'attack';
		if (this._attack > originalCard.attack) {
			this.attackClass += ' buff';
		} else if (this._attack < originalCard.attack) {
			this.attackClass += ' debuff';
		}
	}

	private updateHealthClass(originalCard) {
		this.healthClass = 'health';
		if (this._damage > 0) {
			this.healthClass += ' damaged';
		}
	}
}
