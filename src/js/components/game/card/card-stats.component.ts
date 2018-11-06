import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { AllCardsService } from '../../../services/all-cards.service';

@Component({
	selector: 'card-stats',
	styleUrls: [
		'../../../../css/global/text.scss',
		'../../../../css/components/game/card/card-stats.component.scss'
	],
	template: `
        <div class="card-stats" *ngIf="hasStats">
            <div class="{{attackClass}}"><span>{{_attack}}</span></div>
            <div class="{{healthClass}}"><span>{{healthLeft}}</span></div>
            <div class="armor"><span>{{_armor}}</span></div>
        </div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardStatsComponent {

    hasStats: boolean;

    attackClass: string;
    healthClass: string;
    healthLeft: number;

    _attack: number;
    _armor: number;
    
    private _cardId: string;
    private _health: number;
    private _damage: number;
    private _durability: number;

    constructor(private cards: AllCardsService) { }

    @Input('cardId') set cardId(cardId: string) {
        console.log('[card-stats] setting cardId', cardId);
        this._cardId = cardId;
        this.updateStats();
    }

    @Input('attack') set attack(attack: number) {
        console.log('[card-stats] setting attack', attack);
        this._attack = attack;
        this.updateStats();
    }

    @Input('health') set health(health: number) {
        console.log('[card-stats] setting health', health);
        this._health = health;
        this.updateStats();
    }

    @Input('damage') set damage(damage: number) {
        console.log('[card-stats] setting damage', damage);
        this._damage = damage;
        this.updateStats();
    }

    @Input('durability') set durability(durability: number) {
        console.log('[card-stats] setting durability', durability);
        this._durability = durability;
        this.updateStats();
    }

    @Input('armor') set armor(armor: number) {
        console.log('[card-stats] setting armor', armor);
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
        if (this._durability == null) {
            this._durability = originalCard.durability;
        }
        if (this._armor == null) {
            this._armor = originalCard.armor;
        }
        this.hasStats = originalCard.attack || originalCard.health || originalCard.durability || originalCard.armor;

        this.healthLeft = (this._health || this._durability) - (this._damage);
        this.updateAttackClass(originalCard);
        this.updateHealthClass(originalCard);
    }

    private updateAttackClass(originalCard) {
        this.attackClass = 'attack';
        if (this._attack > originalCard.attack) {
            this.attackClass += ' buff';
        }
        else if (this._attack < originalCard.attack) {
            this.attackClass += ' debuff';
        }
    }

    private updateHealthClass(originalCard) {
        this.healthClass = 'health';
        if (this._health > originalCard.health) {
            this.healthClass += ' buff';
        }
        else if (this._health < originalCard.health) {
            this.healthClass += ' damanged';
        }
    }
}