import { Map } from 'immutable';
import isEqual from 'lodash-es/isEqual';
import uniq from 'lodash-es/uniq';
import { Action } from '../../../models/action/action';
import { AttachingEnchantmentAction } from '../../../models/action/attaching-enchantment-action';
import { CardTargetAction } from '../../../models/action/card-target-action';
import { PowerTargetAction } from '../../../models/action/power-target-action';
import { GameTag } from '../../../models/enums/game-tags';
import { Zone } from '../../../models/enums/zone';
import { Entity } from '../../../models/game/entity';
import { HistoryItem } from '../../../models/history/history-item';
import { TagChangeHistoryItem } from '../../../models/history/tag-change-history-item';
import { AllCardsService } from '../../all-cards.service';
import { ActionHelper } from './action-helper';
import { Parser } from './parser';

export class AttachingEnchantmentParser implements Parser {
	constructor(private allCards: AllCardsService) {}

	public applies(item: HistoryItem): boolean {
		return item instanceof TagChangeHistoryItem && item.tag.tag === GameTag.ZONE && item.tag.value === Zone.PLAY;
	}

	public parse(
		item: TagChangeHistoryItem,
		currentTurn: number,
		entitiesBeforeAction: Map<number, Entity>,
		history: readonly HistoryItem[],
	): Action[] {
		const entityId = item.tag.entity;
		const entity = entitiesBeforeAction.get(entityId);
		const attachedToEntityId = entity.getTag(GameTag.ATTACHED);
		if (!attachedToEntityId) {
			return;
		}
		const creatorId = entity.getTag(GameTag.CREATOR);

		return [
			AttachingEnchantmentAction.create(
				{
					timestamp: item.timestamp,
					index: item.index,
					originId: creatorId,
					// Enchantments with the same name are duplicated so we have a 1-1 mapping
					// with the card that is enchanted
					enchantmentCardId: entity.cardID,
					targetIds: [attachedToEntityId],
				},
				this.allCards,
			),
		];
	}

	public reduce(actions: readonly Action[]): readonly Action[] {
		return ActionHelper.combineActions<AttachingEnchantmentAction>(
			actions,
			(previous, current) => this.shouldMergeActions(previous, current),
			(previous, current) => this.mergeActions(previous, current),
		);
	}

	private shouldMergeActions(previousAction: Action, currentAction: Action): boolean {
		if (previousAction instanceof AttachingEnchantmentAction && currentAction instanceof AttachingEnchantmentAction) {
			const prev = previousAction as AttachingEnchantmentAction;
			const curr = currentAction as AttachingEnchantmentAction;
			if (prev.originId === curr.originId && prev.enchantmentCardId === curr.enchantmentCardId) {
				return true;
			}
		}
		if (
			(previousAction instanceof CardTargetAction || previousAction instanceof PowerTargetAction) &&
			currentAction instanceof AttachingEnchantmentAction
		) {
			// console.log('merging enchantment into target?', previousAction, currentAction);
			if (previousAction.originId === currentAction.originId && isEqual(previousAction.targetIds, currentAction.targetIds)) {
				// console.log('merging enchantment into target', previousAction, currentAction);
				return true;
			}
		}
		return false;
	}

	private mergeActions(
		previousAction: AttachingEnchantmentAction | CardTargetAction | PowerTargetAction,
		currentAction: AttachingEnchantmentAction,
	): AttachingEnchantmentAction {
		const targetIds =
			previousAction instanceof AttachingEnchantmentAction
				? uniq([...uniq(previousAction.targetIds || []), ...uniq(currentAction.targetIds || [])])
				: uniq(currentAction.targetIds || []);
		return AttachingEnchantmentAction.create(
			{
				timestamp: previousAction.timestamp,
				index: previousAction.index,
				entities: currentAction.entities,
				originId: currentAction.originId,
				enchantmentCardId: currentAction.enchantmentCardId,
				targetIds: targetIds,
			},
			this.allCards,
		);
	}
}
