import { Map } from 'immutable';
import uniq from 'lodash-es/uniq';
import { NGXLogger } from 'ngx-logger';
import { Action } from '../../../models/action/action';
import { CardBurnAction } from '../../../models/action/card-burn-action';
import { GameTag } from '../../../models/enums/game-tags';
import { MetaTags } from '../../../models/enums/meta-tags';
import { Entity } from '../../../models/game/entity';
import { HistoryItem } from '../../../models/history/history-item';
import { MetadataHistoryItem } from '../../../models/history/metadata-history-item';
import { Info } from '../../../models/parser/info';
import { AllCardsService } from '../../all-cards.service';
import { ActionHelper } from './action-helper';
import { Parser } from './parser';

export class CardBurnParser implements Parser {
	constructor(private allCards: AllCardsService, private logger: NGXLogger) {}

	public applies(item: HistoryItem): boolean {
		return item instanceof MetadataHistoryItem && (item as MetadataHistoryItem).meta.meta === MetaTags[MetaTags.BURNED_CARD];
	}

	public parse(
		item: MetadataHistoryItem,
		currentTurn: number,
		entitiesBeforeAction: Map<number, Entity>,
		history: readonly HistoryItem[],
	): Action[] {
		return item.meta.info.map(info => this.buildBurnAction(item, info, entitiesBeforeAction));
	}

	private buildBurnAction(item: MetadataHistoryItem, info: Info, entitiesBeforeAction: Map<number, Entity>): Action {
		const controller = entitiesBeforeAction.get(info.entity).getTag(GameTag.CONTROLLER);
		if (!controller) {
			this.logger.error('[card-burn-parser] empty controller', info, entitiesBeforeAction.get(info.entity));
		}
		return CardBurnAction.create(
			{
				timestamp: item.timestamp,
				index: item.index,
				controller: controller,
				burnedCardIds: [info.entity],
			},
			this.allCards,
		);
	}

	public reduce(actions: readonly Action[]): readonly Action[] {
		return ActionHelper.combineActions<CardBurnAction>(
			actions,
			(previous, current) => this.shouldMergeActions(previous, current),
			(previous, current) => this.mergeActions(previous, current),
		);
	}

	private shouldMergeActions(previous: Action, current: Action): boolean {
		if (!(previous instanceof CardBurnAction && current instanceof CardBurnAction)) {
			return false;
		}
		if (previous.controller === undefined || current.controller === undefined) {
			this.logger.error('[card-burn-parser] Empty controller for burn action', previous, current);
		}
		return previous.controller === current.controller;
	}

	private mergeActions(previousAction: CardBurnAction, currentAction: CardBurnAction): CardBurnAction {
		return CardBurnAction.create(
			{
				timestamp: previousAction.timestamp,
				index: currentAction.index,
				entities: currentAction.entities,
				controller: currentAction.controller,
				burnedCardIds: uniq([...uniq(previousAction.burnedCardIds || []), ...uniq(currentAction.burnedCardIds || [])]),
			},
			this.allCards,
		);
	}
}
