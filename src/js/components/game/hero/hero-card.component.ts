import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CardType, GameTag } from '@firestone-hs/reference-data';
import { Entity } from '@firestone-hs/replay-parser';

@Component({
	selector: 'hero-card',
	styleUrls: ['../../../../css/components/game/hero/hero-card.component.scss'],
	template: `
		<div
			class="hero-card"
			[ngClass]="{ 'highlight': _option }"
			[attr.data-entity-id]="entityId"
			[attr.data-player-entity-id]="playerEntityId"
		>
			<hero-art [cardId]="cardId"></hero-art>
			<hero-frame [premium]="premium"></hero-frame>
			<hero-overlays [entity]="_entity"></hero-overlays>
			<secrets [secrets]="_secrets" *ngIf="_secrets && _secrets.length > 0"></secrets>
			<hero-stats [cardId]="cardId" [attack]="attack" [health]="health" [damage]="damage" [armor]="armor">
			</hero-stats>
			<damage *ngIf="shownDamage" [amount]="shownDamage"></damage>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroCardComponent {
	_entity: Entity;
	_playerEntity: Entity;
	// Some actions use the player id instead of the entity id when describing targets
	// so having both of them makes us able to ignore these discrepancies
	playerEntityId: number;
	entityId: number;
	cardId: string;
	cardType: CardType;
	attack: number;
	health: number;
	damage: number;
	armor: number;
	shownDamage: number;
	premium: boolean;
	_option: boolean;
	_secrets: readonly Entity[];

	@Input('hero') set hero(hero: Entity) {
		// console.log('[hero-card] setting hero', hero, hero && hero.tags.toJS());
		this._entity = hero;
		this.updateInfo();
	}

	@Input() set playerEntity(value: Entity) {
		this._playerEntity = value;
		this.updateInfo();
	}

	private updateInfo() {
		this.entityId = this._entity ? this._entity.id : null;
		this.playerEntityId = this._playerEntity ? this._playerEntity.id : null; // If they ever change this logic we need to do something :)
		this.cardId = this._entity ? this._entity.cardID : null;
		this.cardType = CardType.HERO;
		this.attack = this._entity ? this._entity.getTag(GameTag.ATK) : null;
		this.health = this._entity ? this._entity.getTag(GameTag.HEALTH) : null;
		this.damage = this._entity ? this._entity.getTag(GameTag.DAMAGE) : null;
		this.armor = this._entity ? this._entity.getTag(GameTag.ARMOR) : null;
		this.premium = this._entity ? this._entity.getTag(GameTag.PREMIUM) === 1 : null;

		this.shownDamage = this._entity ? this._entity.damageForThisAction : null;
	}

	@Input('option') set option(value: boolean) {
		this._option = value;
	}

	@Input('secrets') set secrets(value: readonly Entity[]) {
		// console.log('[hero-card] setting secrets', value);
		this._secrets = value;
	}
}
