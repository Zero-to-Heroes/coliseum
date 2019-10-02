import { Map } from 'immutable';
import { NGXLogger } from 'ngx-logger';
import { Action } from '../../../models/action/action';
import { MulliganCardAction } from '../../../models/action/mulligan-card-action';
import { BlockType } from '../../../models/enums/block-type';
import { GameTag } from '../../../models/enums/game-tags';
import { Zone } from '../../../models/enums/zone';
import { Entity } from '../../../models/game/entity';
import { GameHepler } from '../../../models/game/game-helper';
import { ActionHistoryItem } from '../../../models/history/action-history-item';
import { HistoryItem } from '../../../models/history/history-item';
import { AllCardsService } from '../../all-cards.service';
import { ActionHelper } from './action-helper';
import { Parser } from './parser';

export class MulliganCardParser implements Parser {
	constructor(private allCards: AllCardsService, private logger: NGXLogger) {}

	public applies(item: HistoryItem): boolean {
		return item instanceof ActionHistoryItem;
	}

	public parse(
		item: ActionHistoryItem,
		currentTurn: number,
		entitiesBeforeAction: Map<number, Entity>,
		history: readonly HistoryItem[],
	): Action[] {
		if (currentTurn > 0) {
			return;
		}
		// Adding the cards mulliganed by the player
		if (
			parseInt(item.node.attributes.type) === BlockType.TRIGGER &&
			item.node.hideEntities &&
			item.node.hideEntities.length > 0 &&
			GameHepler.isPlayerEntity(parseInt(item.node.attributes.entity), entitiesBeforeAction)
		) {
			const result = [
				MulliganCardAction.create(
					{
						timestamp: item.timestamp,
						index: item.index,
						playerMulligan: item.node.hideEntities,
					},
					this.allCards,
				),
			];
			return result;
		}
		if (
			parseInt(item.node.attributes.type) === BlockType.TRIGGER &&
			GameHepler.isPlayerEntity(parseInt(item.node.attributes.entity), entitiesBeforeAction) &&
			item.node.tags &&
			item.node.tags.length > 0
		) {
			const relevantTags = item.node.tags.filter(tag => tag.tag === GameTag.ZONE && tag.value === Zone.DECK);
			if (relevantTags && relevantTags.length > 0) {
				const result = relevantTags.map(tag =>
					MulliganCardAction.create(
						{
							timestamp: item.timestamp,
							index: item.index,
							opponentMulligan: [tag.entity],
						},
						this.allCards,
					),
				);
				return result;
			}
		}
		return null;
	}

	public reduce(actions: readonly Action[]): readonly Action[] {
		return ActionHelper.combineActions<MulliganCardAction>(
			actions,
			(previous, current) => previous instanceof MulliganCardAction && current instanceof MulliganCardAction,
			(previous, current) => this.mergeActions(previous, current),
		);
	}

	private mergeActions(previousAction: MulliganCardAction, currentAction: MulliganCardAction): MulliganCardAction {
		return MulliganCardAction.create(
			{
				timestamp: previousAction.timestamp,
				index: previousAction.index,
				entities: currentAction.entities,
				playerMulligan: [...(previousAction.playerMulligan || []), ...(currentAction.playerMulligan || [])],
				opponentMulligan: [...(previousAction.opponentMulligan || []), ...(currentAction.opponentMulligan || [])],
			},
			this.allCards,
		);
	}
}
