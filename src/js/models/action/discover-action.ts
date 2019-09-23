import { Map } from 'immutable';
import { AllCardsService } from '../../services/all-cards.service';
import { ActionHelper } from '../../services/parser/action/action-helper';
import { Entity } from '../game/entity';
import { PlayerEntity } from '../game/player-entity';
import { Action } from './action';

export class DiscoverAction extends Action {
	readonly origin: number;
	readonly ownerId: number;
	readonly choices: readonly number[];
	readonly chosen: readonly number[];

	readonly allCards: AllCardsService;

	constructor(allCards: AllCardsService) {
		super();
		this.allCards = allCards;
	}

	public static create(newAction, allCards: AllCardsService): DiscoverAction {
		return Object.assign(new DiscoverAction(allCards), newAction);
	}

	public update(entities: Map<number, Entity>): DiscoverAction {
		return Object.assign(new DiscoverAction(this.allCards), this, { entities: entities });
	}

	public enrichWithText(): DiscoverAction {
		const owner = this.entities.get(this.ownerId) as PlayerEntity;

		const offeredCards = this.choices
			.map(entityId => ActionHelper.getCardId(this.entities, entityId))
			.map(cardId => this.allCards.getCard(cardId));
		let offerInfo = '';
		// We don't have the mulligan info, so we just display the amount of cards being mulliganed
		if (offeredCards.some(card => !card || !card.name)) {
			offerInfo = `${offeredCards.length} cards`;
		} else {
			offerInfo = offeredCards.map(card => card.name).join(', ');
		}

		const chosenCards =
			this.chosen &&
			this.chosen.length > 0 &&
			this.chosen.map(entityId => ActionHelper.getCardId(this.entities, entityId)).map(cardId => this.allCards.getCard(cardId));
		if (!chosenCards) {
			console.error(
				'Trying to do a discover action with an empty chosen array, aborting',
				this.origin,
				this.ownerId,
				this.choices,
				this.chosen,
			);
			return this;
		}
		let choiceInfo;
		// We don't have the mulligan info, so we just display the amount of cards being mulliganed
		if (chosenCards.some(card => !card || !card.name)) {
			choiceInfo = `${chosenCards.length} cards`;
		} else {
			choiceInfo = chosenCards.map(card => card.name).join(', ');
		}
		const chosenText = choiceInfo && ` and picks ${choiceInfo}`;
		const textRaw = `\t${owner.name} discovers ${offerInfo}${chosenText}`;
		return Object.assign(new DiscoverAction(this.allCards), this, { textRaw: textRaw });
	}

	protected getInstance(): Action {
		return new DiscoverAction(this.allCards);
	}
}
