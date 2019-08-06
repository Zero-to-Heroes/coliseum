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
import { EntityDefinition } from '../../../models/parser/entity-definition';
import { SummonAction } from '../../../models/action/summon-action';
import { ActionHelper } from './action-helper';
import { uniq } from 'lodash';

export class SummonsParser implements Parser {
	constructor(private allCards: AllCardsService) {}

	public applies(item: HistoryItem): boolean {
		return item instanceof ActionHistoryItem;
	}

	public parse(
		item: ActionHistoryItem,
		currentTurn: number,
		entitiesBeforeAction: Map<number, Entity>,
		history: readonly HistoryItem[],
	): Action[] {
		if (parseInt(item.node.attributes.type) !== BlockType.TRIGGER && parseInt(item.node.attributes.type) !== BlockType.POWER) {
			return;
		}

		let entities: readonly EntityDefinition[];
		if (item.node.fullEntities && item.node.fullEntities.length > 0) {
			entities = item.node.fullEntities;
		} else if (item.node.showEntities && item.node.showEntities.length > 0) {
			entities = item.node.showEntities;
		}
		if (!entities) {
			return;
		}

		return entities
			.filter(entity => entity.tags.get(GameTag[GameTag.ZONE]) === Zone.PLAY)
			.filter(entity => entity.tags.get(GameTag[GameTag.CARDTYPE]) === CardType.MINION)
			.map(entity => {
				return SummonAction.create(
					{
						timestamp: item.timestamp,
						index: entity.index,
						entityIds: [entity.id],
						origin: parseInt(item.node.attributes.entity),
					},
					this.allCards,
				);
			});
	}

	public reduce(actions: readonly Action[]): readonly Action[] {
		return ActionHelper.combineActions<SummonAction>(
			actions,
			(previous, current) => this.shouldMergeActions(previous, current),
			(previous, current) => this.mergeActions(previous, current),
		);
	}

	private shouldMergeActions(previousAction: Action, currentAction: Action): boolean {
		if (!(previousAction instanceof SummonAction) || !(currentAction instanceof SummonAction)) {
			return false;
		}
		if ((previousAction as SummonAction).origin !== (currentAction as SummonAction).origin) {
			return false;
		}
		return true;
	}

	private mergeActions(previousAction: SummonAction, currentAction: SummonAction): SummonAction {
		return SummonAction.create(
			{
				timestamp: previousAction.timestamp,
				index: previousAction.index,
				entities: currentAction.entities,
				origin: currentAction.origin,
				entityIds: uniq([...uniq(previousAction.entityIds || []), ...uniq(currentAction.entityIds || [])]),
			},
			this.allCards,
		);
	}
}
