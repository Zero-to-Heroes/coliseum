import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, ViewRef } from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { AllCardsService } from '../../../services/all-cards.service';
import { CardType } from '../../../models/enums/card-type';
import { NGXLogger } from 'ngx-logger';
import { Entity } from '../../../models/game/entity';
import { GameTag } from '../../../models/enums/game-tags';

@Component({
	selector: 'card-text',
	styleUrls: [
		'../../../../css/global/text.scss',
		'../../../../css/components/game/card/card-text.component.scss'
	],
	template: `
        <div class="card-text {{_cardType}}" *ngIf="text">
            <div class="text" 
                    [fittext]="true" 
                    [minFontSize]="2" 
                    [useMaxFontSize]="true" 
                    [activateOnResize]="false"
                    [modelToWatch]="dirtyFlag"
                    [innerHTML]="text"></div>
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
    ]

	_cardType: string;
    text: SafeHtml;
    maxFontSize: number;
    dirtyFlag: boolean = false;

    constructor(
            private cards: AllCardsService, 
            private domSanitizer: DomSanitizer,
            private logger: NGXLogger,
            private cdr: ChangeDetectorRef) {
        document.addEventListener(
            'card-resize',
            (event) => this.resizeText(),
            true);
        }
    
    @Input('entity') set entity(value: Entity) {
        const cardId = value.cardID;
        this.logger.debug('[card-text] setting cardId', cardId);
        this.text = undefined;
        const originalCard = this.cards.getCard(cardId);
        if (!originalCard.text) {
            if (!(<ViewRef>this.cdr).destroyed) {
                this.cdr.detectChanges();
            }
            return;
        }
        // There are a few cards whose text is truncated in the json cards export
        const originalText = this.CARD_IDS_TO_FIX.indexOf(cardId) !== -1
                ? originalCard.text + ' @' + originalCard.collectionText
                : originalCard.text;
        let description: string = originalText
                .replace('\n', '<br/>')
                .replace(/\u00a0/g, " ")
                .replace(/^\[x\]/, "");
        // E.g. Fatespinner
        if (value.getTag(GameTag.HIDDEN_CHOICE) && description.indexOf('@') !== -1) {
            console.log('hidden choice', value.tags.toJS(), description);
            description = description.split('@')[value.getTag(GameTag.HIDDEN_CHOICE)];
        }

        description = description
                // Now replace the value, if relevant
                .replace('@', `${value.getTag(GameTag.TAG_SCRIPT_DATA_NUM_1)}`);
        this.text = this.domSanitizer.bypassSecurityTrustHtml(description);
        if (!(<ViewRef>this.cdr).destroyed) {
            this.cdr.detectChanges();
        }
    }
	
    @Input('cardType') set cardType(cardType: CardType) {
        this.logger.debug('[card-text] setting cardType', cardType);
        this._cardType = CardType[cardType].toLowerCase();
    }

    private resizeText() {
        this.dirtyFlag = !this.dirtyFlag;
        if (!(<ViewRef>this.cdr).destroyed) {
            this.cdr.detectChanges();
        }
    }
}
