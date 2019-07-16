import { Parser } from './parser';
import { HistoryItem } from '../../../models/history/history-item';
import { Action } from '../../../models/action/action';
import { AllCardsService } from '../../all-cards.service';
import { Entity } from '../../../models/game/entity';
import { Map } from 'immutable';
import { TagChangeHistoryItem } from '../../../models/history/tag-change-history-item';
import { GameTag } from '../../../models/enums/game-tags';
import { DamageAction } from '../../../models/action/damage-action';
import { Zone } from '../../../models/enums/zone';
import { AttackAction } from '../../../models/action/attack-action';
import { ActionHelper } from './action-helper';
import { NGXLogger } from 'ngx-logger';
import { HealingAction } from '../../../models/action/healing-action';
import { PowerTargetAction } from '../../../models/action/power-target-action';
import { Damage } from '../../../models/action/damage';
import { OptionsHistoryItem } from '../../../models/history/options-history-item';
import { OptionsAction } from '../../../models/action/options-action';

export class OptionsParser implements Parser {

	constructor(private allCards: AllCardsService, private logger: NGXLogger) {}

	public applies(item: HistoryItem): boolean {
		return item instanceof OptionsHistoryItem;
	}

	public parse(
			item: OptionsHistoryItem,
			currentTurn: number,
			entitiesBeforeAction: Map<number, Entity>,
			history: ReadonlyArray<HistoryItem>): Action[] {
		return [OptionsAction.create(
			{
				timestamp: item.timestamp,
				index: item.index,
				options: item.tag.options.filter(option => !option.error || option.error === -1).map(option => option.entity),
			},
			this.allCards,
		)];
	}

	public reduce(actions: ReadonlyArray<Action>): ReadonlyArray<Action> {
		return ActionHelper.combineActions<Action>(
			actions,
			(previous, current) => this.shouldMergeActions(previous, current),
			(previous, current) => this.mergeActions(previous, current)
		);
	}

	private shouldMergeActions(previousAction: Action, currentAction: Action): boolean {
		return currentAction instanceof OptionsAction;
	}

	private mergeActions(previousAction: Action, currentAction: Action): Action {
		return previousAction.updateAction({
			index: currentAction.index,
			entities: currentAction.entities,
			options: [...(previousAction.options || []), ...(currentAction.options || [])] as ReadonlyArray<number>,
		} as Action);
	}
}
