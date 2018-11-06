import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Entity } from '../../../models/game/entity';
import { CardType } from '../../../models/enums/card-type';

@Component({
	selector: 'hero-card',
	styleUrls: [
        '../../../../css/components/game/hero/hero-card.component.scss'
    ],
	template: `
        <div class="hero-card">
            <hero-art [cardId]="cardId"></hero-art>
            <hero-frame></hero-frame>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroCardComponent {

    cardId: string;
    cardType: CardType;

    @Input('hero') set hero(hero: Entity) {
        // TODO: iverkats (frozen, etc), secrets, highlight, stats
        console.log('[hero-card] setting new entity', hero);
        this.cardId = hero.cardID;
        this.cardType = CardType.HERO;
    }
}
