import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CardClass, GameTag } from '@firestone-hs/reference-data';
import { AllCardsService, Entity } from '@firestone-hs/replay-parser';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'secret-revealed',
	styleUrls: ['../../../css/components/game/secret-revealed.component.scss'],
	template: `
		<div class="secret-revealed" cardElementResize [fontSizeRatio]="0.1">
			<img class="splash" src="{{ splashImage }}" />
			<div class="banner">
				<img src="{{ bannerImage }}" />
				<div class="text" resizeTarget><span>Secret!</span></div>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretRevealedComponent {
	splashImage: string;
	bannerImage: string;

	constructor(private logger: NGXLogger, private cards: AllCardsService) {}

	@Input('entity') set entity(value: Entity) {
		this.logger.debug('[secret-revealed] setting new entity', value);
		if (value) {
			const playerClass: number = value.getTag(GameTag.CLASS);
			let classString: string;
			if (playerClass) {
				classString = this.getClassString(playerClass);
			} else if (value.cardID) {
				const card = this.cards.getCard(value.cardID);
				classString = this.getClassStringFromDb(card.cardClass);
			}

			if (classString) {
				this.splashImage = `https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/secrets/secret_splash_${classString}.png`;
				this.bannerImage = `https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/secrets/secret_banner_${classString}.png`;
			} else {
				this.logger.error('[secret-revealed] Could not assign player class', value, value.tags.toJS());
			}
		}
	}

	private getClassString(playerClass: number): string {
		switch (playerClass) {
			case CardClass.HUNTER:
				return 'hunter';
			case CardClass.MAGE:
				return 'mage';
			case CardClass.PALADIN:
				return 'paladin';
			case CardClass.ROGUE:
				return 'rogue';
			default:
				this.logger.error('[secret-revealed] invalid class requested', playerClass);
				return '';
		}
	}

	private getClassStringFromDb(playerClass: string): string {
		switch (playerClass) {
			case 'HUNTER':
				return 'hunter';
			case 'MAGE':
				return 'mage';
			case 'PALADIN':
				return 'paladin';
			case 'ROGUE':
				return 'rogue';
			default:
				this.logger.error('[secret-revealed] invalid class requested', playerClass);
				return '';
		}
	}
}
