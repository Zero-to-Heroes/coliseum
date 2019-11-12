import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CardType, GameTag } from '@firestone-hs/reference-data';
import { Entity } from '@firestone-hs/replay-parser';
import { NGXLogger } from 'ngx-logger';

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
			<hero-stats [cardId]="cardId" [attack]="attack" [health]="health" [damage]="damage" [armor]="armor"> </hero-stats>
			<damage *ngIf="shownDamage" [amount]="shownDamage"></damage>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroCardComponent {
	_entity: Entity;
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

	constructor(private logger: NGXLogger) {}

	@Input('hero') set hero(hero: Entity) {
		this.logger.debug('[hero-card] setting hero', hero, hero && hero.tags.toJS());
		this._entity = hero;
		if (!hero) {
			return;
		}
		this.entityId = hero.id;
		this.playerEntityId = hero.getTag(GameTag.CONTROLLER) + 1; // If they ever change this logic we need to do something :)
		this.cardId = hero.cardID;
		this.cardType = CardType.HERO;
		this.attack = hero.getTag(GameTag.ATK);
		this.health = hero.getTag(GameTag.HEALTH);
		this.damage = hero.getTag(GameTag.DAMAGE);
		this.armor = hero.getTag(GameTag.ARMOR);
		this.premium = hero.getTag(GameTag.PREMIUM) === 1;

		this.shownDamage = hero.damageForThisAction;
	}

	@Input('option') set option(value: boolean) {
		this._option = value;
	}

	@Input('secrets') set secrets(value: readonly Entity[]) {
		this.logger.debug('[hero-card] setting secrets', value);
		this._secrets = value;
	}
}
