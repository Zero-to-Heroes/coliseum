import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Entity } from '../../../models/game/entity';
import { GameTag } from '../../../models/enums/game-tags';
import { CardType } from '../../../models/enums/card-type';
import { CardClass } from '../../../models/enums/card-class';
import { AllCardsService } from '../../../services/all-cards.service';

@Component({
	selector: 'card-on-board',
	styleUrls: [
		'../../../../css/components/game/board/card-on-board.component.scss'
	],
	template: `
		<div class="card-on-board">
			<card-art [cardId]="cardId" [cardType]="cardType"></card-art>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardOnBoardComponent {

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
		console.log('[card-on-board] setting entity', entity);
		
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
