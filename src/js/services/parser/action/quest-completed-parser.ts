import { Parser } from './parser';
import { HistoryItem } from '../../../models/history/history-item';
import { ActionHistoryItem } from '../../../models/history/action-history-item';
import { Action } from '../../../models/action/action';
import { AllCardsService } from '../../all-cards.service';
import { BlockType } from '../../../models/enums/block-type';
import { Entity } from '../../../models/game/entity';
import { Map } from 'immutable';
import { NGXLogger } from 'ngx-logger';
import { GameTag } from '../../../models/enums/game-tags';
import { QuestCompletedAction } from '../../../models/action/quest-completed-action';

export class QuestCompletedParser implements Parser {
	constructor(private allCards: AllCardsService, private logger: NGXLogger) {}

	public applies(item: HistoryItem): boolean {
		return item instanceof ActionHistoryItem && parseInt(item.node.attributes.type) === BlockType.TRIGGER;
	}

	public parse(
		item: ActionHistoryItem,
		currentTurn: number,
		entitiesBeforeAction: Map<number, Entity>,
		history: readonly HistoryItem[],
	): Action[] {
		const originId = parseInt(item.node.attributes.entity);
		const entity = entitiesBeforeAction.get(originId);
		if (entity.getTag(GameTag.QUEST) === 1 && item.node.fullEntities && item.node.fullEntities.length === 1) {
			return [
				QuestCompletedAction.create(
					{
						timestamp: item.timestamp,
						index: item.index,
						originId: originId,
					},
					this.allCards,
				),
			];
		}
		return [];
	}

	public reduce(actions: readonly Action[]): readonly Action[] {
		return actions;
	}
}
