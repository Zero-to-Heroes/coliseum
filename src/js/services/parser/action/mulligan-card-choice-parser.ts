import { Parser } from './parser';
import { HistoryItem } from '../../../models/history/history-item';
import { Action } from '../../../models/action/action';
import { AllCardsService } from '../../all-cards.service';
import { GameTag } from '../../../models/enums/game-tags';
import { Zone } from '../../../models/enums/zone';
import { NGXLogger } from 'ngx-logger';
import { Entity } from '../../../models/game/entity';
import { Map } from 'immutable';
import { ActionHelper } from './action-helper';
import { ChosenEntityHistoryItem } from '../../../models/history/chosen-entities-history-item';
import { PlayerEntity } from '../../../models/game/player-entity';
import { MulliganCardChoiceAction } from '../../../models/action/mulligan-card-choice-action';
import { StartTurnAction } from '../../../models/action/start-turn-action';
import { MulliganCardAction } from '../../../models/action/mulligan-card-action';

export class MulliganCardChoiceParser implements Parser {
	constructor(private allCards: AllCardsService, private logger: NGXLogger) {}

	public applies(item: HistoryItem): boolean {
		return item instanceof ChosenEntityHistoryItem;
	}

	public parse(
		item: ChosenEntityHistoryItem,
		currentTurn: number,
		entitiesBeforeAction: Map<number, Entity>,
		history: readonly HistoryItem[],
		players: readonly PlayerEntity[],
	): Action[] {
		if (currentTurn > 0) {
			return;
		}

		const keptCards = item.tag.cards;
		const playerHand = this.getHandEntityIds(entitiesBeforeAction, item.tag.entity);
		const mulligan = playerHand.filter(entityId => keptCards.indexOf(entityId) === -1);
		if (item.tag.playerID === players[0].id) {
			return [
				MulliganCardChoiceAction.create(
					{
						timestamp: item.timestamp,
						index: item.index,
						playerMulligan: mulligan,
					},
					this.allCards,
				),
			];
		} else if (item.tag.playerID === players[1].id) {
			return [
				MulliganCardChoiceAction.create(
					{
						timestamp: item.timestamp,
						index: item.index,
						opponentMulligan: mulligan,
					},
					this.allCards,
				),
			];
		} else {
			this.logger.error('Invalid mulligan choice', item, players);
		}
		return null;
	}

	public reduce(actions: readonly Action[]): readonly Action[] {
		return ActionHelper.combineActions<MulliganCardChoiceAction | StartTurnAction>(
			actions,
			(previous, current) =>
				(previous instanceof MulliganCardChoiceAction && current instanceof MulliganCardChoiceAction) ||
				(previous instanceof StartTurnAction && current instanceof MulliganCardChoiceAction),
			(previous, current) => this.mergeActions(previous, current),
			(previous, current) => previous instanceof MulliganCardAction && current instanceof MulliganCardChoiceAction,
		);
	}

	private mergeActions(
		previousAction: MulliganCardChoiceAction | StartTurnAction,
		currentAction: MulliganCardChoiceAction | StartTurnAction,
	): MulliganCardChoiceAction | StartTurnAction {
		if (currentAction instanceof StartTurnAction) {
			this.logger.error('Invalid mulligan action merge', previousAction, currentAction);
			return previousAction;
		}
		if (previousAction instanceof MulliganCardChoiceAction) {
			return MulliganCardChoiceAction.create(
				{
					timestamp: previousAction.timestamp,
					index: previousAction.index,
					entities: currentAction.entities,
					playerMulligan: [...(previousAction.playerMulligan || []), ...(currentAction.playerMulligan || [])],
					opponentMulligan: [...(previousAction.opponentMulligan || []), ...(currentAction.opponentMulligan || [])],
				},
				this.allCards,
			);
		} else {
			return StartTurnAction.create({
				turn: previousAction.turn,
				entities: previousAction.entities,
				crossedEntities: [
					...(previousAction.crossedEntities || []),
					...(currentAction.playerMulligan || []),
					...(currentAction.opponentMulligan || []),
				],
			});
		}
	}

	private getHandEntityIds(entities: Map<number, Entity>, playerId: number): readonly number[] {
		return entities
			.toArray()
			.filter(entity => entity.getTag(GameTag.CONTROLLER) === playerId)
			.filter(entity => entity.getTag(GameTag.ZONE) === Zone.HAND)
			.map(entity => entity.id);
	}
}
