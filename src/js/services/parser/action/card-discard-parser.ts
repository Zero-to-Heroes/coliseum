import { Parser } from './parser';
import { HistoryItem } from '../../../models/history/history-item';
import { Action } from '../../../models/action/action';
import { TagChangeHistoryItem } from '../../../models/history/tag-change-history-item';
import { GameTag } from '../../../models/enums/game-tags';
import { Zone } from '../../../models/enums/zone';
import { AllCardsService } from '../../all-cards.service';
import { Entity } from '../../../models/game/entity';
import { Map } from 'immutable';
import { uniq } from 'lodash';
import { ActionHelper } from './action-helper';
import { NGXLogger } from 'ngx-logger';
import { CardDiscardAction } from '../../../models/action/card-discard-action';

export class CardDiscardParser implements Parser {
	constructor(private allCards: AllCardsService, private logger: NGXLogger) {}

	public applies(item: HistoryItem): boolean {
		return item instanceof TagChangeHistoryItem && item.tag.tag === GameTag.ZONE && item.tag.value === Zone.SETASIDE;
	}

	public parse(
		item: TagChangeHistoryItem,
		currentTurn: number,
		entitiesBeforeAction: Map<number, Entity>,
		history: readonly HistoryItem[],
	): Action[] {
		if (currentTurn === 0) {
			return;
		}

		const previousZone = entitiesBeforeAction.get(item.tag.entity).getTag(GameTag.ZONE);
		if (previousZone === Zone.HAND) {
			const controller = entitiesBeforeAction.get(item.tag.entity).getTag(GameTag.CONTROLLER);
			if (!controller) {
				this.logger.error('[card-discard-parser] empty controller', item, entitiesBeforeAction.get(item.tag.entity));
			}
			return [
				CardDiscardAction.create(
					{
						timestamp: item.timestamp,
						index: item.index,
						controller: controller,
						data: [item.tag.entity],
					},
					this.allCards,
				),
			];
		}

		return [];
	}

	public reduce(actions: readonly Action[]): readonly Action[] {
		return ActionHelper.combineActions<CardDiscardAction>(
			actions,
			(previous, current) => this.shouldMergeActions(previous, current),
			(previous, current) => this.mergeActions(previous, current),
		);
	}

	private shouldMergeActions(previous: Action, current: Action): boolean {
		if (!(previous instanceof CardDiscardAction && current instanceof CardDiscardAction)) {
			return false;
		}
		if (previous.controller === undefined || current.controller === undefined) {
			this.logger.error('[card-discard-parser] Empty controller for draw action', previous, current);
		}
		return previous.controller === current.controller;
	}

	private mergeActions(previousAction: CardDiscardAction, currentAction: CardDiscardAction): CardDiscardAction {
		return CardDiscardAction.create(
			{
				timestamp: previousAction.timestamp,
				index: currentAction.index,
				entities: currentAction.entities,
				controller: currentAction.controller,
				data: uniq([...uniq(previousAction.data || []), ...uniq(currentAction.data || [])]),
			},
			this.allCards,
		);
	}
}
