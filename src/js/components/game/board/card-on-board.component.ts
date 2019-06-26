import { Component, ChangeDetectionStrategy, Input, HostListener, ElementRef, AfterViewInit, ViewRef, ChangeDetectorRef } from '@angular/core';
import { Entity } from '../../../models/game/entity';
import { GameTag } from '../../../models/enums/game-tags';
import { CardType } from '../../../models/enums/card-type';
import { CardClass } from '../../../models/enums/card-class';
import { AllCardsService } from '../../../services/all-cards.service';
import { Events } from '../../../services/events.service';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'card-on-board',
	styleUrls: [
		'../../../../css/components/game/board/card-on-board.component.scss'
	],
	template: `
		<div class="card-on-board" 
                cardTooltip [tooltipEntity]="_entity" [hasTooltip]="true"
                [attr.data-entity-id]="_entity.id">
			<card-art [cardId]="cardId" [cardType]="cardType"></card-art>
            <board-card-frame 
                    [taunt]="taunt" 
                    [hideStats]="hideStats"
                    [premium]="premium">
            </board-card-frame>
			<board-card-stats *ngIf="!hideStats"
					[cardId]="cardId" 
					[attack]="attack"
					[health]="health"
					[damage]="damage">
			</board-card-stats>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardOnBoardComponent implements AfterViewInit {

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
	taunt: boolean;
    shownDamage: number;
    hideStats: boolean;

	constructor(
		private cards: AllCardsService, 
		private elRef: ElementRef, 
		private cdr: ChangeDetectorRef,
		private logger: NGXLogger,
		private events: Events) { }

    @Input('entity') set entity(entity: Entity) {
		this.logger.debug('[card-on-board] setting entity', entity);
		
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

		this.taunt = entity.getTag(GameTag.TAUNT) == 1;

        this.shownDamage = entity.damageForThisAction;
        
        this.hideStats = entity.getTag(GameTag.HIDE_STATS) === 1;
    }

	ngAfterViewInit() {
		setTimeout(() => this.resize());
	}

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.resize();
    }

	private resize() {
        const el = this.elRef.nativeElement;
        const width = 140.0 / 187 * el.getBoundingClientRect().height;
		const textEl = this.elRef.nativeElement;
		textEl.style.width = width + 'px';
        if (!(<ViewRef>this.cdr).destroyed) {
            this.cdr.detectChanges();
        }
		setTimeout(() => {
			el.dispatchEvent(new Event('card-resize', { bubbles: false }));
		});
	}
}
