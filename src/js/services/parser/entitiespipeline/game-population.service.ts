import { Injectable } from '@angular/core';
import { fromJS, Map } from 'immutable';
import { NGXLogger } from 'ngx-logger';
import { CardType } from '../../../models/enums/card-type';
import { GameTag } from '../../../models/enums/game-tags';
import { Entity } from '../../../models/game/entity';
import { PlayerEntity } from '../../../models/game/player-entity';
import { FullEntityHistoryItem } from '../../../models/history/full-entity-history-item';
import { GameHistoryItem } from '../../../models/history/game-history-item';
import { HistoryItem } from '../../../models/history/history-item';
import { PlayerHistoryItem } from '../../../models/history/player-history-item';
import { ShowEntityHistoryItem } from '../../../models/history/show-entity-history-item';
import { TagChangeHistoryItem } from '../../../models/history/tag-change-history-item';
import { EntityDefinition } from '../../../models/parser/entity-definition';
import { AllCardsService } from '../../all-cards.service';

@Injectable()
export class GamePopulationService {
	constructor(private allCards: AllCardsService, private logger: NGXLogger) {}

	public populateInitialEntities(history: readonly HistoryItem[]): Map<number, Entity> {
		// Map of entityId - entity definition
		const entities: Map<number, Entity> = Map();
		const entitiesAfterInit: Map<number, Entity> = this.initializeEntities(history, entities);
		const entitiesAfterMissingInfo: Map<number, Entity> = this.completeMissingInformation(history, entitiesAfterInit);
		const entitiesAfterBasicData: Map<number, Entity> = this.addBasicData(entitiesAfterMissingInfo);
		return entitiesAfterBasicData;
	}

	private initializeEntities(history: readonly HistoryItem[], entities: Map<number, Entity>): Map<number, Entity> {
		let result = entities;
		for (const item of history) {
			if (item instanceof PlayerHistoryItem) {
				result = this.initializePlayer(item, result);
			} else if (item instanceof GameHistoryItem) {
				result = this.initializeGame(item, result);
			} else if (item instanceof FullEntityHistoryItem) {
				result = this.initializeFullEntity(item, result);
			} else if (item instanceof ShowEntityHistoryItem) {
				result = this.initializeShowEntity(item, result);
			}
		}
		return result;
	}

	private initializePlayer(historyItem: PlayerHistoryItem, entities: Map<number, Entity>): Map<number, Entity> {
		// Remove the battle tag if present
		const playerName =
			historyItem.entityDefintion.name.indexOf('#') !== -1
				? historyItem.entityDefintion.name.split('#')[0]
				: historyItem.entityDefintion.name;
		const entity: PlayerEntity = PlayerEntity.create({
			id: historyItem.entityDefintion.id,
			playerId: historyItem.entityDefintion.playerID,
			name: playerName,
		} as PlayerEntity).update(historyItem.entityDefintion);
		return entities.set(entity.id, entity);
	}

	private initializeGame(historyItem: GameHistoryItem, entities: Map<number, Entity>): Map<number, Entity> {
		const entity: Entity = Entity.create({ id: historyItem.entityDefintion.id } as Entity).update(historyItem.entityDefintion);
		return entities.set(entity.id, entity);
	}

	private initializeFullEntity(historyItem: FullEntityHistoryItem, entities: Map<number, Entity>): Map<number, Entity> {
		const newAttributes: any = {};
		// We use the ShowEntity only to update the cardID at this stage
		// and for a few other tags.
		// Since we don't stop at mulligan stage, this means that otherwise
		// a lot of other entities will be created
		if (historyItem.entityDefintion.cardID) {
			newAttributes.cardID = historyItem.entityDefintion.cardID;
		}
		const entity: Entity = entities
			.get(historyItem.entityDefintion.id, Entity.create({ id: historyItem.entityDefintion.id } as Entity))
			.update(newAttributes as EntityDefinition);
		return entities.set(entity.id, entity);
	}

	private initializeShowEntity(historyItem: ShowEntityHistoryItem, entities: Map<number, Entity>): Map<number, Entity> {
		const newAttributes: any = {};
		// Same here
		if (historyItem.entityDefintion.cardID) {
			newAttributes.cardID = historyItem.entityDefintion.cardID;
		}
		const entity: Entity = entities
			.get(historyItem.entityDefintion.id, Entity.create({ id: historyItem.entityDefintion.id } as Entity))
			.update(newAttributes as EntityDefinition);
		return entities.set(entity.id, entity);
	}

	private completeMissingInformation(history: readonly HistoryItem[], entities: Map<number, Entity>): Map<number, Entity> {
		let result = entities;
		for (const item of history) {
			if (item instanceof TagChangeHistoryItem) {
				result = this.addTagInformation(item, result);
			}
			if (item instanceof ShowEntityHistoryItem) {
				result = this.addEntityInformation(item, result);
			}
		}
		return result;
	}

	private addTagInformation(item: TagChangeHistoryItem, entities: Map<number, Entity>): Map<number, Entity> {
		if (item.tag.tag === GameTag.SECRET && item.tag.value === 1) {
			const entity: Entity = entities.get(item.tag.entity).update({ tags: fromJS({ [GameTag[item.tag.tag]]: 1 }) });
			return entities.set(entity.id, entity);
		} else if (item.tag.tag === GameTag.QUEST && item.tag.value === 1) {
			const entity: Entity = entities.get(item.tag.entity).update({ tags: fromJS({ [GameTag[item.tag.tag]]: 1 }) });
			return entities.set(entity.id, entity);
		} else if (item.tag.tag === GameTag.PARENT_CARD) {
			const entity: Entity = entities.get(item.tag.entity).update({ tags: fromJS({ [GameTag[item.tag.tag]]: item.tag.value }) });
			return entities.set(entity.id, entity);
		}
		return entities;
	}

	private addEntityInformation(item: ShowEntityHistoryItem, entities: Map<number, Entity>): Map<number, Entity> {
		let result = entities;
		if (item.entityDefintion.tags.get(GameTag[GameTag.SECRET]) === 1) {
			const entity: Entity = entities
				.get(item.entityDefintion.id)
				.update({ tags: Map<string, number>().set(GameTag[GameTag.SECRET], 1) });
			result = entities.set(entity.id, entity);
		}
		const newTags: Map<string, number> = Map<string, number>()
			.set(GameTag[GameTag.CREATOR], item.entityDefintion.tags.get(GameTag[GameTag.CREATOR]))
			.set(GameTag[GameTag.TAG_SCRIPT_DATA_NUM_1], item.entityDefintion.tags.get(GameTag[GameTag.TAG_SCRIPT_DATA_NUM_1]))
			.set(GameTag[GameTag.TAG_SCRIPT_DATA_NUM_2], item.entityDefintion.tags.get(GameTag[GameTag.TAG_SCRIPT_DATA_NUM_2]));
		const finalEntity: Entity = result.get(item.entityDefintion.id).update({ tags: newTags });
		return result.set(finalEntity.id, finalEntity);
	}

	private addBasicData(entities: Map<number, Entity>): Map<number, Entity> {
		return entities
			.map((value: Entity) => {
				const card = this.allCards.getCard(value.cardID);
				let newTags = Map<string, number>();
				if (card) {
					if (card.type === 'Spell' && !value.getTag(GameTag.CARDTYPE)) {
						newTags = value.tags.set(GameTag[GameTag.CARDTYPE], CardType.SPELL);
					}
					if (card.type === 'Enchantment' && !value.getTag(GameTag.CARDTYPE)) {
						newTags = value.tags.set(GameTag[GameTag.CARDTYPE], CardType.ENCHANTMENT);
					}
				}
				return value.update({ tags: newTags });
			})
			.toMap();
	}
}
