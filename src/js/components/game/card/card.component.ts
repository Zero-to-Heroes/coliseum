import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CardClass, CardType, GameTag } from '@firestone-hs/reference-data';
import { AllCardsService, Entity } from '@firestone-hs/replay-parser';
import { NGXLogger } from 'ngx-logger';
import { GameConfService } from '../../../services/game-conf.service';

@Component({
	selector: 'card',
	styleUrls: ['../../../../css/components/game/card/card.component.scss'],
	template: `
		<div
			class="card"
			[ngClass]="{ 'highlight': _option }"
			cardResize
			cardTooltip
			[tooltipEntity]="_entity"
			[tooltipControllerEntity]="_controller"
			[hasTooltip]="_showCard && _hasTooltip"
			[attr.data-entity-id]="!forbiddenTargetSource && _entity.id"
		>
			<card-art [cardId]="cardId" [cardType]="cardType"></card-art>
			<card-frame [cardId]="cardId" [premium]="premium" *ngIf="cardId"></card-frame>
			<card-rarity [cardId]="cardId" *ngIf="cardId"></card-rarity>
			<card-name [cardId]="cardId" *ngIf="cardId"></card-name>
			<card-text *ngIf="cardId" [entity]="_entity" [controller]="_controller" [cardType]="cardType"> </card-text>
			<card-race *ngIf="race" [race]="race"> </card-race>
			<card-cost *ngIf="cardId && !tavernTier" [cardType]="cardType" [cardId]="cardId" [cost]="cost"> </card-cost>
			<tavern-level-icon *ngIf="tavernTier > 0" [level]="tavernTier"></tavern-level-icon>
			<card-stats
				*ngIf="cardId"
				[cardId]="cardId"
				[attack]="attack"
				[health]="health"
				[damage]="damage"
				[durability]="durability"
				[armor]="armor"
			>
			</card-stats>
			<overlay-crossed *ngIf="_crossed"></overlay-crossed>
			<overlay-burned *ngIf="_burned"></overlay-burned>
			<overlay-ticked *ngIf="_ticked"></overlay-ticked>
			<card-enchantments *ngIf="_enchantments && _enchantments.length > 0" [enchantments]="_enchantments">
			</card-enchantments>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
	_entity: Entity;
	_showCard = true;
	_controller: Entity;
	_option: boolean;
	_crossed: boolean;
	_burned: boolean;
	_ticked: boolean;
	_enchantments: readonly Entity[];

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
	race: string;
	tavernTier: number;

	_forbiddenTargetSource = false;
	_hasTooltip = true;

	constructor(private cards: AllCardsService, private conf: GameConfService, private logger: NGXLogger) {}

	@Input('entity') set entity(entity: Entity) {
		this.logger.debug('[card] setting entity', entity);
		this._entity = entity;
		this.updateEntityGroups();
	}

	@Input('showCard') set showCard(value: boolean) {
		this._showCard = value;
		this.updateEntityGroups();
	}

	@Input('controller') set controller(value: Entity) {
		this.logger.debug('[card] setting controller', value);
		this._controller = value;
	}

	@Input('hasTooltip') set hasTooltip(hasTooltip: boolean) {
		this._hasTooltip = hasTooltip;
	}

	@Input('forbiddenTargetSource') set forbiddenTargetSource(value: boolean) {
		this._forbiddenTargetSource = value;
	}

	@Input('option') set option(value: boolean) {
		this._option = value;
	}

	@Input('crossed') set crossed(value: boolean) {
		this._crossed = value;
		if (value) {
			this.logger.debug('[card] marking card as crossed', this._entity);
		}
	}

	@Input('burned') set burned(value: boolean) {
		this._burned = value;
		if (value) {
			this.logger.debug('[card] marking card as burned', this._entity);
		}
	}

	@Input('ticked') set ticked(value: boolean) {
		this._ticked = value;
		if (value) {
			this.logger.debug('[card] marking card as ticked', this._entity);
		}
	}

	@Input('enchantments') set enchantments(value: readonly Entity[]) {
		this._enchantments = value;
	}

	private updateEntityGroups() {
		if (!this._showCard) {
			this.cardId = undefined;
			this.premium = undefined;
			this.attack = undefined;
			this.health = undefined;
			this.damage = undefined;
			this.durability = undefined;
			this.armor = undefined;
			this.cost = undefined;
			this.originalCard = undefined;
			this.race = undefined;
			this.cardType = undefined;
			this.cardClass = undefined;
			return;
		}
		this.cardId = this._entity.cardID;
		if (this.cardId) {
			this.premium = this._entity.getTag(GameTag.PREMIUM) === 1;
			this.attack = this._entity.getTag(GameTag.ATK);
			this.health = this._entity.getTag(GameTag.HEALTH);
			this.damage = this._entity.getTag(GameTag.DAMAGE);
			this.durability = this._entity.getTag(GameTag.DURABILITY);
			this.armor = this._entity.getTag(GameTag.ARMOR);
			this.cost = this._entity.getTag(GameTag.COST);
			this.originalCard = this.cards.getCard(this.cardId);
			this.race = this.originalCard?.race?.toLowerCase();
			this.cardType =
				this.originalCard && this.originalCard.type
					? CardType[this.originalCard.type.toUpperCase() as string]
					: undefined;
			this.cardClass =
				this.originalCard && this.originalCard.playerClass
					? CardClass[this.originalCard.playerClass.toUpperCase() as string]
					: undefined;
			this.tavernTier = this.conf.isBattlegrounds() ? this._entity.getTag(GameTag.TECH_LEVEL) : 0;
		}
	}
}
