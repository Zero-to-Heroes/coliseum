import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Entity } from '../../../models/game/entity';
import { CardType } from '../../../models/enums/card-type';
import { GameTag } from '../../../models/enums/game-tags';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'hero-card',
	styleUrls: [
        '../../../../css/components/game/hero/hero-card.component.scss'
    ],
	template: `
        <div class="hero-card" [attr.data-entity-id]="entityId">
            <hero-art [cardId]="cardId"></hero-art>
            <hero-frame></hero-frame>
			<hero-stats 
					[cardId]="cardId" 
					[attack]="attack"
					[health]="health"
					[damage]="damage"
                    [armor]="armor">
            </hero-stats>
            <damage *ngIf="shownDamage" [amount]="shownDamage"></damage>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroCardComponent {

    entityId: number;
    cardId: string;
    cardType: CardType;
	attack: number;
	health: number;
	damage: number;
	armor: number;
    shownDamage: number;

	constructor(private logger: NGXLogger) { }

    @Input('hero') set hero(hero: Entity) {
        // TODO: overlays (frozen, etc), secrets, highlight, stats
        this.logger.debug('[hero-card] setting new entity', hero);
        this.entityId = hero.id;
        this.cardId = hero.cardID;
        this.cardType = CardType.HERO;
		this.attack = hero.getTag(GameTag.ATK);
		this.health = hero.getTag(GameTag.HEALTH);
		this.damage = hero.getTag(GameTag.DAMAGE);
		this.armor = hero.getTag(GameTag.ARMOR);

		this.shownDamage = hero.damageForThisAction;
    }
}
