import { Map } from 'immutable';
import uniq from 'lodash-es/uniq';
import { Action } from '../../../models/action/action';
import { MinionDeathAction } from '../../../models/action/minion-death-action';
import { BlockType } from '../../../models/enums/block-type';
import { GameTag } from '../../../models/enums/game-tags';
import { Zone } from '../../../models/enums/zone';
import { Entity } from '../../../models/game/entity';
import { ActionHistoryItem } from '../../../models/history/action-history-item';
import { HistoryItem } from '../../../models/history/history-item';
import { TagChangeHistoryItem } from '../../../models/history/tag-change-history-item';
import { AllCardsService } from '../../all-cards.service';
import { ActionHelper } from './action-helper';
import { Parser } from './parser';

export class MinionDeathParser implements Parser {
	constructor(private allCards: AllCardsService) {}

	public applies(item: HistoryItem): boolean {
		return item instanceof ActionHistoryItem || item instanceof TagChangeHistoryItem;
	}

	public parse(
		item: ActionHistoryItem | TagChangeHistoryItem,
		currentTurn: number,
		entitiesBeforeAction: Map<number, Entity>,
		history: readonly HistoryItem[],
	): Action[] {
		if (item instanceof ActionHistoryItem) {
			if (parseInt(item.node.attributes.type) !== BlockType.DEATHS) {
				return;
			}
			if (item.node.tags) {
				for (const tag of item.node.tags) {
					if (tag.tag === GameTag.ZONE && tag.value === Zone.GRAVEYARD) {
						return [
							MinionDeathAction.create(
								{
									timestamp: item.timestamp,
									index: item.index,
									deadMinions: [tag.entity],
								},
								this.allCards,
							),
						];
					}
				}
			}
		}
		if (item instanceof TagChangeHistoryItem) {
			if (item.tag.tag !== GameTag.ZONE || item.tag.value !== Zone.GRAVEYARD) {
				return;
			}
			const parentActionId = item.tag.parentIndex;
			const parentAction = history.find(historyItem => historyItem.index === parentActionId);
			// We make sure the death occurs during a DEATH phase, so that we don't count the
			// "dead spells", ie spells that have been used and go to the graveyard
			if (
				!parentAction ||
				!(parentAction instanceof ActionHistoryItem) ||
				parseInt(parentAction.node.attributes.type) !== BlockType.DEATHS
			) {
				return;
			}
			return [
				MinionDeathAction.create(
					{
						timestamp: item.timestamp,
						index: item.index,
						deadMinions: [item.tag.entity],
					},
					this.allCards,
				),
			];
		}
	}

	public reduce(actions: readonly Action[]): readonly Action[] {
		return ActionHelper.combineActions<MinionDeathAction>(
			actions,
			(previous, current) => previous instanceof MinionDeathAction && current instanceof MinionDeathAction,
			(previous, current) => this.mergeActions(previous, current),
		);
	}

	private mergeActions(previousAction: MinionDeathAction, currentAction: MinionDeathAction): MinionDeathAction {
		return MinionDeathAction.create(
			{
				timestamp: previousAction.timestamp,
				index: previousAction.index,
				entities: currentAction.entities,
				deadMinions: uniq([...uniq(previousAction.deadMinions || []), ...uniq(currentAction.deadMinions || [])]),
			},
			this.allCards,
		);
	}
}
