import { Parser } from './parser';
import { HistoryItem } from '../../../models/history/history-item';
import { ActionHistoryItem } from '../../../models/history/action-history-item';
import { Action } from '../../../models/action/action';
import { AllCardsService } from '../../all-cards.service';
import { BlockType } from '../../../models/enums/block-type';
import { Entity } from '../../../models/game/entity';
import { Map } from 'immutable';
import { GameTag } from '../../../models/enums/game-tags';
import { CardType } from '../../../models/enums/card-type';
import { Zone } from '../../../models/enums/zone';
import { CardPlayedFromHandAction } from '../../../models/action/card-played-from-hand-action';

export class CardPlayedFromHandParser implements Parser {

	constructor(private allCards: AllCardsService) {}

	public applies(item: HistoryItem): boolean {
		return item instanceof ActionHistoryItem;
	}

	public parse(
			item: ActionHistoryItem,
			currentTurn: number,
			entitiesBeforeAction: Map<number, Entity>,
			history: ReadonlyArray<HistoryItem>): Action[] {
		if (parseInt(item.node.attributes.type) !== BlockType.PLAY) {
			return;
		}
		if (!item.node.tags) {
			return;
		}

		let playedCardId = -1;
		// The case of a ShowEntity command when the card was already known - basically
		// when we play our own card. In that case, the tags are already known, and
		// tag changes are the only things we care about
		for (const tag of item.node.tags) {
			if (tag.tag === GameTag.ZONE && tag.value === Zone.PLAY) {
				if (entitiesBeforeAction.get(tag.entity).getTag(GameTag.CARDTYPE) !== CardType.ENCHANTMENT) {
					playedCardId = tag.entity;
				}
			}
		}
		// The case of a ShowEntity (or FullEntity) when we didn't previously know the
		// card. In that case, a ShowEntity (or FullEntity) element is created that contains
		// the tag with the proper zone
		// Use entities when playing Eviscerate at t6o at
		// http://www.zerotoheroes.com/r/hearthstone/572de12ee4b0d4231295c49e/an-arena-game-going-5-0
		if (playedCardId < 0 && item.node.showEntities) {
			for (const showEntity of item.node.showEntities) {
				if (showEntity.tags.get(GameTag[GameTag.ZONE]) === Zone.PLAY
						&& showEntity.tags.get(GameTag[GameTag.CARDTYPE]) !== CardType.ENCHANTMENT) {
					playedCardId = showEntity.id;
				}
			}
		}

		if (playedCardId === -1) {
			return;
		}

		return [CardPlayedFromHandAction.create(
			{
				timestamp: item.timestamp,
				index: item.index,
				entityId: playedCardId,
			},
			this.allCards)];
	}

	public reduce(actions: ReadonlyArray<Action>): ReadonlyArray<Action> {
		return actions;
	}
}
