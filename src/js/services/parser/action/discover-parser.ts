import { Map } from 'immutable';
import { Action } from '../../../models/action/action';
import { DiscoverAction } from '../../../models/action/discover-action';
import { ChoiceType } from '../../../models/enums/choice-type';
import { Entity } from '../../../models/game/entity';
import { ChoicesHistoryItem } from '../../../models/history/choices-history-item';
import { HistoryItem } from '../../../models/history/history-item';
import { AllCardsService } from '../../all-cards.service';
import { Parser } from './parser';

export class DiscoverParser implements Parser {
	constructor(private allCards: AllCardsService) {}

	public applies(item: HistoryItem): boolean {
		return item instanceof ChoicesHistoryItem;
	}

	public parse(
		item: ChoicesHistoryItem,
		currentTurn: number,
		entitiesBeforeAction: Map<number, Entity>,
		history: readonly HistoryItem[],
	): Action[] {
		if (currentTurn === 0) {
			return;
		}
		if (item.choices.type !== ChoiceType.GENERAL) {
			return [];
		}
		return [
			DiscoverAction.create(
				{
					timestamp: item.timestamp,
					index: item.index,
					origin: item.choices.source,
					ownerId: item.choices.playerID,
					choices: item.choices.cards,
				},
				this.allCards,
			),
		];
	}

	public reduce(actions: readonly Action[]): readonly Action[] {
		return actions;
	}
}
