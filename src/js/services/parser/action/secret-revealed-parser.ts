import { Parser } from './parser';
import { HistoryItem } from '../../../models/history/history-item';
import { ActionHistoryItem } from '../../../models/history/action-history-item';
import { Action } from '../../../models/action/action';
import { AllCardsService } from '../../all-cards.service';
import { BlockType } from '../../../models/enums/block-type';
import { Entity } from '../../../models/game/entity';
import { Map } from 'immutable';
import { GameTag } from '../../../models/enums/game-tags';
import { SecretRevealedAction } from '../../../models/action/secret-revealed-action';

export class SecretRevealedParser implements Parser {
	constructor(private allCards: AllCardsService) {}

	public applies(item: HistoryItem): boolean {
		return item instanceof ActionHistoryItem && parseInt(item.node.attributes.type) === BlockType.TRIGGER;
	}

	public parse(
		item: ActionHistoryItem,
		currentTurn: number,
		entitiesBeforeAction: Map<number, Entity>,
		history: readonly HistoryItem[],
	): Action[] {
		const entity = entitiesBeforeAction.get(parseInt(item.node.attributes.entity));
		if (entity.getTag(GameTag.SECRET) !== 1) {
			return;
		}
		return [
			SecretRevealedAction.create(
				{
					timestamp: item.timestamp,
					index: item.index,
					entityId: entity.id,
				},
				this.allCards,
			),
		];
	}

	public reduce(actions: readonly Action[]): readonly Action[] {
		return actions;
	}
}
