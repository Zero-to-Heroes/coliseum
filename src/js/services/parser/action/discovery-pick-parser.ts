import { Parser } from './parser';
import { HistoryItem } from '../../../models/history/history-item';
import { Action } from '../../../models/action/action';
import { AllCardsService } from '../../all-cards.service';
import { Entity } from '../../../models/game/entity';
import { Map } from 'immutable';
import { DiscoverAction } from '../../../models/action/discover-action';
import { ChosenEntityHistoryItem } from '../../../models/history/chosen-entities-history-item';
import { DiscoveryPickAction } from '../../../models/action/discovery-pick-action';
import { ActionHelper } from './action-helper';
import { NGXLogger } from 'ngx-logger';

export class DiscoveryPickParser implements Parser {
	constructor(private allCards: AllCardsService, private logger: NGXLogger) {}

	public applies(item: HistoryItem): boolean {
		return item instanceof ChosenEntityHistoryItem && item.tag.cards && item.tag.cards.length === 1;
	}

	public parse(
		item: ChosenEntityHistoryItem,
		currentTurn: number,
		entitiesBeforeAction: Map<number, Entity>,
		history: readonly HistoryItem[],
	): Action[] {
		return [
			DiscoveryPickAction.create(
				{
					timestamp: item.timestamp,
					index: item.index,
					owner: item.tag.playerID,
					choice: item.tag.cards[0],
				},
				this.allCards,
			),
		];
	}

	public reduce(actions: readonly Action[]): readonly Action[] {
		return ActionHelper.combineActions<Action>(
			actions,
			(previous, current) => this.shouldMergeActions(previous, current),
			(previous, current) => this.mergeActions(previous, current),
		);
	}

	private shouldMergeActions(previousAction: Action, currentAction: Action): boolean {
		// Merge it into the discover action
		if (previousAction instanceof DiscoverAction && currentAction instanceof DiscoveryPickAction) {
			return true;
		} else if (currentAction instanceof DiscoveryPickAction) {
			this.logger.warn('removing discovery pick action', previousAction, currentAction);
			return true;
		}
		return false;
	}

	private mergeActions(previousAction: Action, currentAction: Action): Action {
		if (previousAction instanceof DiscoverAction && currentAction instanceof DiscoveryPickAction) {
			return previousAction.updateAction<DiscoverAction>({
				chosen: [currentAction.choice] as readonly number[],
			} as DiscoverAction);
		}
		return previousAction;
	}
}
