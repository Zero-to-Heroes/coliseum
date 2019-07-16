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
import { SecretPlayedFromHandAction } from '../../../models/action/secret-played-from-hand-action';

export class SecretPlayedFromHandParser implements Parser {

	constructor(private allCards: AllCardsService) {}

	public applies(item: HistoryItem): boolean {
		return item instanceof ActionHistoryItem
				&& parseInt(item.node.attributes.type) === BlockType.PLAY
				&& (item.node.tags && item.node.tags.length > 0);
	}

	public parse(
			item: ActionHistoryItem,
			currentTurn: number,
			entitiesBeforeAction: Map<number, Entity>,
			history: ReadonlyArray<HistoryItem>): Action[] {
		let playedCardId = -1;
		let isSecret = false;
		for (const tag of item.node.tags) {
			if (tag.tag === GameTag.ZONE && tag.value === Zone.SECRET) {
				if (entitiesBeforeAction.get(tag.entity).getTag(GameTag.CARDTYPE) !== CardType.ENCHANTMENT) {
					playedCardId = tag.entity;
				}
			}
			if (tag.tag === GameTag.SECRET && tag.value === 1) {
				isSecret = true;
			}
		}
		if (!isSecret
				&& entitiesBeforeAction.get(playedCardId)
				&& entitiesBeforeAction.get(playedCardId).getTag(GameTag.SECRET) === 1) {
			isSecret = true;
		}

		if (playedCardId === -1 || !isSecret) {
			return;
		}

		return [SecretPlayedFromHandAction.create(
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
