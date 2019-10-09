import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AllCardsService, CardClass, CardType, Entity, GameTag } from '@firestone-hs/replay-parser';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'card-on-board',
	styleUrls: ['../../../../css/components/game/board/card-on-board.component.scss'],
	template: `
		<div
			class="card-on-board"
			cardResize
			cardTooltip
			[tooltipEntity]="_entity"
			[tooltipEnchantments]="_enchantments"
			[attr.data-entity-id]="_entity.id"
		>
			<div class="main-card" [ngClass]="{ 'highlight': _option }">
				<card-art [cardId]="cardId" [cardType]="cardType"></card-art>
				<board-card-frame [taunt]="taunt" [hideStats]="hideStats" [premium]="premium"> </board-card-frame>
				<board-card-stats *ngIf="!hideStats" [cardId]="cardId" [attack]="attack" [health]="health" [damage]="damage">
				</board-card-stats>
			</div>
			<damage *ngIf="shownDamage" [amount]="shownDamage"></damage>
			<sleeping *ngIf="sleeping"></sleeping>
			<power-indicator [entity]="_entity"></power-indicator>
			<card-on-board-overlays [entity]="_entity"></card-on-board-overlays>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardOnBoardComponent {
	_entity: Entity;
	_enchantments: readonly Entity[];
	_option: boolean;

	cardId: string;
	cardType: CardType;
	cardClass: CardClass;
	originalCard: any;
	premium: boolean;
	attack: number;
	health: number;
	damage: number;
	durability: number;
	armor: number;
	cost: number;
	taunt: boolean;
	shownDamage: number;
	hideStats: boolean;
	sleeping: boolean;

	constructor(private cards: AllCardsService, private logger: NGXLogger) {}

	@Input('entity') set entity(entity: Entity) {
		this.logger.debug('[card-on-board] setting entity', entity.id, entity, entity.tags.toJS());

		this._entity = entity;

		this.cardId = entity.cardID;
		this.originalCard = this.cards.getCard(this.cardId);
		this.cardType = this.originalCard && this.originalCard.type ? CardType[this.originalCard.type.toUpperCase() as string] : undefined;
		this.cardClass =
			this.originalCard && this.originalCard.playerClass
				? CardClass[this.originalCard.playerClass.toUpperCase() as string]
				: undefined;

		this.premium = entity.getTag(GameTag.PREMIUM) === 1;
		this.attack = entity.getTag(GameTag.ATK);
		this.health = entity.getTag(GameTag.HEALTH);
		this.damage = entity.getTag(GameTag.DAMAGE);
		this.durability = entity.getTag(GameTag.DURABILITY);
		this.armor = entity.getTag(GameTag.ARMOR);
		this.cost = entity.getTag(GameTag.COST);

		this.taunt = entity.getTag(GameTag.TAUNT) === 1;

		this.shownDamage = entity.damageForThisAction;

		this.hideStats = entity.getTag(GameTag.HIDE_STATS) === 1;
		this.sleeping =
			entity.getTag(GameTag.EXHAUSTED) === 1 && entity.getTag(GameTag.JUST_PLAYED) === 1 && entity.getTag(GameTag.CHARGE) !== 1;
	}

	@Input('option') set option(value: boolean) {
		this._option = value;
	}

	@Input('enchantments') set enchantments(value: readonly Entity[]) {
		this.logger.debug('[card-on-board] setting enchantments', value);
		this._enchantments = value;
	}
}
