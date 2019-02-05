import { Component, ChangeDetectionStrategy, Input, HostListener, ElementRef, AfterViewInit, ViewRef, ChangeDetectorRef } from '@angular/core';
import { Entity } from '../../../models/game/entity';
import { GameTag } from '../../../models/enums/game-tags';
import { CardType } from '../../../models/enums/card-type';
import { CardClass } from '../../../models/enums/card-class';
import { AllCardsService } from '../../../services/all-cards.service';
import { Events } from '../../../services/events.service';

@Component({
	selector: 'card-on-board',
	styleUrls: [
		'../../../../css/components/game/board/card-on-board.component.scss'
	],
	template: `
		<div class="card-on-board">
			<card-art [cardId]="cardId" [cardType]="cardType"></card-art>
			<board-card-frame [taunt]="taunt" [premium]="premium"></board-card-frame>
			<board-card-stats 
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

	constructor(
		private cards: AllCardsService, 
		private elRef: ElementRef, 
		private cdr: ChangeDetectorRef,
		private events: Events) { }

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

		this.taunt = entity.getTag(GameTag.TAUNT) == 1;
    }

	@HostListener('mouseenter') onMouseEnter() {
		let x = 100;
		let y = 0;
		let element = this.elRef.nativeElement;
		while (element && !element.classList.contains("external-player")) {
			x += element.offsetLeft;
			y += element.offsetTop;
			element = element.offsetParent;
		}
		// TODO: compute this once at component init + after each resize, instead of every time
		// TODO: move the logic away to tooltips component, so it can take care of auto positioning
		this.events.broadcast(Events.SHOW_TOOLTIP, this._entity, x, y);
	}

	@HostListener('mouseleave')
	onMouseLeave() {
		this.events.broadcast(Events.HIDE_TOOLTIP, this._entity);
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
        const width = 120.0 / 187 * el.getBoundingClientRect().height;
		const textEl = this.elRef.nativeElement;
        // console.log('[card] Element width', width, el.getBoundingClientRect(), textEl);
		textEl.style.width = width + 'px';
        if (!(<ViewRef>this.cdr).destroyed) {
            this.cdr.detectChanges();
        }
		setTimeout(() => {
			el.dispatchEvent(new Event('card-resize', { bubbles: false }));
		});
	}
}
