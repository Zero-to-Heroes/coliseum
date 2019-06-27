import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Entity } from '../../../models/game/entity';
import { GameTag } from '../../../models/enums/game-tags';
import { CardType } from '../../../models/enums/card-type';
import { CardClass } from '../../../models/enums/card-class';
import { NGXLogger } from 'ngx-logger';
import { AllCardsService } from '../../../services/all-cards.service';

@Component({
	selector: 'card',
	styleUrls: [
		'../../../../css/components/game/card/card.component.scss'
	],
	template: `
        <div class="card" 
                cardResize
                cardTooltip [tooltipEntity]="_entity" [hasTooltip]="_hasTooltip"
                [attr.data-entity-id]="!forbiddenTargetSource && _entity.id">
			<card-art [cardId]="cardId" [cardType]="cardType"></card-art>
			<card-frame [cardId]="cardId" [premium]="premium" *ngIf="cardId"></card-frame>
			<card-rarity [cardId]="cardId" *ngIf="cardId"></card-rarity>
			<card-name [cardId]="cardId" *ngIf="cardId"></card-name>
            <card-text *ngIf="cardId"
                    [entity]="_entity"
                    [cardType]="cardType">
            </card-text>
            <card-race *ngIf="race" 
                    [race]="race">
            </card-race>
            <card-cost *ngIf="cardId"
                    [cardType]="cardType"
                    [cardId]="cardId" 
                    [cost]="cost">
            </card-cost>
			<card-stats *ngIf="cardId"
					[cardId]="cardId" 
					[attack]="attack"
					[health]="health"
					[damage]="damage"
					[durability]="durability"
					[armor]="armor">
            </card-stats>
            <overlay-crossed *ngIf="_crossed"></overlay-crossed>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {

    _entity: Entity;
    _crossed: boolean;

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

    _forbiddenTargetSource: boolean = false;
	_hasTooltip: boolean = true;

	constructor(
            private cards: AllCardsService, 
            private logger: NGXLogger) { 
    }

    @Input('entity') set entity(entity: Entity) {
		this.logger.debug('[card] setting entity', entity);
		this._entity = entity;
        this.cardId = entity.cardID;
        if (this.cardId) {
            this.premium = entity.getTag(GameTag.PREMIUM) == 1;
            this.attack = entity.getTag(GameTag.ATK);
            this.health = entity.getTag(GameTag.HEALTH);
            this.damage = entity.getTag(GameTag.DAMAGE);
            this.durability = entity.getTag(GameTag.DURABILITY);
            this.armor = entity.getTag(GameTag.ARMOR);
            this.cost = entity.getTag(GameTag.COST);
            this.originalCard = this.cards.getCard(this.cardId);
            this.race = this.originalCard.race ? this.originalCard.race.toLowerCase() : undefined;
            this.cardType = CardType[this.originalCard.type.toUpperCase() as string];
            this.cardClass = CardClass[this.originalCard.playerClass.toUpperCase() as string];
        }
    }

	@Input("hasTooltip") set hasTooltip(hasTooltip: boolean) {
		this._hasTooltip = hasTooltip;
    }
    
	@Input("forbiddenTargetSource") set forbiddenTargetSource(value: boolean) {
		this._forbiddenTargetSource = value;
	}

	@Input("crossed") set crossed(value: boolean) {
        this._crossed = value;
        if (value) {
            this.logger.debug('[card] marking card as crossed', this._entity);
        }
    }
}
