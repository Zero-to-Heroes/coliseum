import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Entity } from '../../../models/game/entity';
import { GameTag } from '../../../models/enums/game-tags';
import { CardType } from '../../../models/enums/card-type';
import { CardClass } from '../../../models/enums/card-class';
import { AllCardsService } from '../../../services/all-cards.service';

@Component({
	selector: 'card',
	styleUrls: [
		'../../../../css/components/game/card/card.component.scss'
	],
	template: `
		<div class="card">
			<card-art [cardId]="cardId" [cardType]="cardType"></card-art>
			<card-frame [cardId]="cardId" [premium]="premium"></card-frame>
			<card-rarity [cardId]="cardId"></card-rarity>
			<card-name [cardId]="cardId"></card-name>
			<!-- TODO: handle all text updates -->
			<card-text [cardId]="cardId"></card-text>
			<card-race [cardId]="cardId"></card-race>
			<card-cost [cardId]="cardId" [cost]="cost"></card-cost>
			<card-stats 
					[cardId]="cardId" 
					[attack]="attack"
					[health]="health"
					[damage]="damage"
					[durability]="durability"
					[armor]="armor">
			</card-stats>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {

	_entity: Entity;

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

	constructor(private cards: AllCardsService) { }

    @Input('entity') set entity(entity: Entity) {
		console.log('[card] setting entity', entity);
		
		this._entity = entity;

		this.cardId = entity.cardID;
		this.originalCard = this.cards.getCard(this.cardId);
		this.cardType = CardType[this.originalCard.type.toUpperCase() as string];
		this.cardClass = CardClass[this.originalCard.playerClass.toUpperCase() as string];

		this.premium = entity.getTag(GameTag.PREMIUM) == 1;
		this.attack = entity.getTag(GameTag.ATK);
		this.health = entity.getTag(GameTag.HEALTH);
		this.damage = entity.getTag(GameTag.DAMAGE);
		this.durability = entity.getTag(GameTag.DURABILITY);
		this.armor = entity.getTag(GameTag.ARMOR);
		this.cost = entity.getTag(GameTag.COST);
    }
}