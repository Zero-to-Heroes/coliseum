import { Map } from 'immutable';
import uniq from 'lodash-es/uniq';
import { AllCardsService } from '../../services/all-cards.service';
import { ActionHelper } from '../../services/parser/action/action-helper';
import { Entity } from '../game/entity';
import { Action } from './action';

export class CardBurnAction extends Action {
	readonly controller: number;
	readonly burnedCardIds: readonly number[];

	constructor(private allCards: AllCardsService) {
		super();
	}

	public static create(newAction, allCards: AllCardsService): CardBurnAction {
		return Object.assign(new CardBurnAction(allCards), newAction);
	}

	public update(entities: Map<number, Entity>): CardBurnAction {
		return Object.assign(this.getInstance(), this, { entities: entities });
	}

	public enrichWithText(): CardBurnAction {
		const ownerNames: string[] = uniq(
			this.burnedCardIds
				.map(entityId => ActionHelper.getOwner(this.entities, entityId))
				.map(playerEntity => {
					if (!playerEntity) {
						console.error(
							'[card-burn-action] no player entity',
							playerEntity,
							this.burnedCardIds,
							this.entities.get(this.burnedCardIds[0]).tags.toJS(),
						);
					}
					return playerEntity.name;
				}),
		);
		if (ownerNames.length !== 1) {
			throw new Error('[card-burn-action] Invalid grouping of cards ' + ownerNames + ', ' + this.burnedCardIds);
		}
		const ownerName = ownerNames[0];
		const drawnCards = this.burnedCardIds
			.map(entityId => ActionHelper.getCardId(this.entities, entityId))
			.map(cardId => this.allCards.getCard(cardId));
		let drawInfo = '';
		// We don't have the mulligan info, so we just display the amount of cards being mulliganed
		if (drawnCards.some(card => !card || !card.name)) {
			drawInfo = `${drawnCards.length} cards`;
		} else {
			drawInfo = drawnCards.map(card => card.name).join(', ');
		}

		const textRaw = `\t${ownerName} burns ` + drawInfo;
		return Object.assign(new CardBurnAction(this.allCards), this, { textRaw: textRaw });
	}

	protected getInstance(): Action {
		return new CardBurnAction(this.allCards);
	}
}
