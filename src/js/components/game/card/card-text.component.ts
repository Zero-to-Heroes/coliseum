import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, ViewRef } from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { AllCardsService } from '../../../services/all-cards.service';
import { CardType } from '../../../models/enums/card-type';
import { NGXLogger } from 'ngx-logger';
import { Entity } from '../../../models/game/entity';
import { GameTag } from '../../../models/enums/game-tags';

@Component({
	selector: 'card-text',
	styleUrls: ['../../../../css/global/text.scss', '../../../../css/components/game/card/card-text.component.scss'],
	template: `
		<div class="card-text {{ _cardType }}" [ngClass]="{ 'premium': premium }" *ngIf="text">
			<div
				class="text"
				[fittext]="true"
				[minFontSize]="2"
				[useMaxFontSize]="true"
				[activateOnResize]="false"
				[modelToWatch]="dirtyFlag"
				[innerHTML]="text"
			></div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardTextComponent {
	private readonly CARD_IDS_TO_FIX = [
		'DAL_357t', // Spirit of Lucentbark
		'DALA_BOSS_07p', // Take Flight!
		'DALA_BOSS_07p2', // Flying!
		'DALA_BOSS_45p', // Ray of Suffering
		'DALA_BOSS_45px', // Ray of Suffering
		'DALA_BOSS_69p', // Dragonwrath
		'DALA_BOSS_69px', // Dragonwrath
		'FB_LK005', // Remorseless Winter
		'GILA_601', // Cannon
		'ICCA08_030p', // Remorseless Winter
		'DAL_007', // Rafaam's Scheme
		'DAL_008', // Dr Boom's Scheme
		'DAL_009', // Hagatha's Scheme
		'DAL_010', // Togwaggle's Scheme
		'DAL_011', // Lazul's Scheme
	];

	_cardType: string;
	premium: boolean;
	text: SafeHtml;
	maxFontSize: number;
	dirtyFlag = false;

	private _entity: Entity;
	private _controller: Entity;

	constructor(
		private cards: AllCardsService,
		private domSanitizer: DomSanitizer,
		private logger: NGXLogger,
		private cdr: ChangeDetectorRef,
	) {
		document.addEventListener('card-resize', event => this.resizeText(), true);
	}

	@Input('entity') set entity(value: Entity) {
		this.logger.debug('[card-text] setting entity', value.tags.toJS());
		this._entity = value;
		this.updateText();
	}

	@Input('controller') set controller(value: Entity) {
		this.logger.debug('[card-text] setting controller', value && value.tags.toJS());
		this._controller = value;
		this.updateText();
	}

	private updateText() {
		if (!this._entity) {
			return;
		}
		const cardId = this._entity.cardID;
		this.text = undefined;
		const originalCard = this.cards.getCard(cardId);
		if (!originalCard.text) {
			if (!(this.cdr as ViewRef).destroyed) {
				this.cdr.detectChanges();
			}
			return;
		}

		// There are a few cards whose text is truncated in the json cards export
		const originalText =
			this.CARD_IDS_TO_FIX.indexOf(cardId) !== -1 ? originalCard.text + ' @' + originalCard.collectionText : originalCard.text;
		let description: string = originalText
			.replace('\n', '<br/>')
			.replace(/\u00a0/g, ' ')
			.replace(/^\[x\]/, '');
		// E.g. Fatespinner
		if (this._entity.getTag(GameTag.HIDDEN_CHOICE) && description.indexOf('@') !== -1) {
			// console.log('hidden choice', this._entity.tags.toJS(), description);
			description = description.split('@')[this._entity.getTag(GameTag.HIDDEN_CHOICE)];
		}
		// Damage placeholder, influenced by spell damage
		let damageBonus = 0;
		let doubleDamage = 0;
		if (this._controller) {
			if (this._entity.getCardType() === CardType.SPELL) {
				damageBonus = this._controller.getTag(GameTag.CURRENT_SPELLPOWER) || 0;
				if (this._entity.getTag(GameTag.RECEIVES_DOUBLE_SPELLDAMAGE_BONUS) === 1) {
					damageBonus *= 2;
				}
				doubleDamage = this._controller.getTag(GameTag.SPELLPOWER_DOUBLE) || 0;
			} else if (this._entity.getCardType() === CardType.HERO_POWER) {
				damageBonus = this._controller.getTag(GameTag.CURRENT_HEROPOWER_DAMAGE_BONUS) || 0;
				doubleDamage = this._controller.getTag(GameTag.HERO_POWER_DOUBLE) || 0;
			}
		}

		description = description
			// Now replace the value, if relevant
			.replace('@', `${this._entity.getTag(GameTag.TAG_SCRIPT_DATA_NUM_1)}`)
			.replace(/\$(\d+)/g, this.modifier(damageBonus, doubleDamage))
			.replace(/\#(\d+)/g, this.modifier(damageBonus, doubleDamage));
		this.text = this.domSanitizer.bypassSecurityTrustHtml(description);

		// Text is not the same color for premium cards
		this.premium = this._entity.getTag(GameTag.PREMIUM) === 1;

		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}

	@Input('cardType') set cardType(cardType: CardType) {
		this.logger.debug('[card-text] setting cardType', cardType);
		this._cardType = CardType[cardType].toLowerCase();
	}

	private resizeText() {
		this.dirtyFlag = !this.dirtyFlag;
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}

	private modifier(bonus: number, double: number) {
		return (match, part1) => {
			let value = +part1;
			if (bonus !== 0 || double !== 0) {
				value += bonus;
				value *= Math.pow(2, double);
				// console.log('updated value', value);
				return '*' + value + '*';
			}
			return '' + value;
		};
	}
}
