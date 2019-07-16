import { Injectable } from '@angular/core';
import { Map } from 'immutable';
import { HistoryItem } from '../../../models/history/history-item';
import { Entity } from '../../../models/game/entity';
import { TagChangeHistoryItem } from '../../../models/history/tag-change-history-item';
import { ShowEntityHistoryItem } from '../../../models/history/show-entity-history-item';
import { GameTag } from '../../../models/enums/game-tags';
import { Step } from '../../../models/enums/step';
import { FullEntityHistoryItem } from '../../../models/history/full-entity-history-item';

@Injectable()
export class GameStateParserService {

	public populateEntitiesUntilMulliganState(history: ReadonlyArray<HistoryItem>, entities: Map<number, Entity>): Map<number, Entity> {
		for (const item of history) {
			if (item instanceof TagChangeHistoryItem) {
				const tagChange: TagChangeHistoryItem = item as TagChangeHistoryItem;
				// Once mulligan state is reached the game has been fully initialized
				if (tagChange.tag.tag === GameTag.MULLIGAN_STATE) {
					break;
				}
				// For some solo modes (like puzzles) there is no mulligan, so we based ourselves on the STEP = READY tag
				if (tagChange.tag.tag === GameTag.STEP
						&& (tagChange.tag.value === Step.MAIN_READY || tagChange.tag.value === Step.BEGIN_MULLIGAN)) {
					break;
				}
				entities = this.updateWithTagChange(tagChange, entities);
			} else if (item instanceof ShowEntityHistoryItem) {
				entities = this.updateWithShowEntity(item, entities);
			} else if (item instanceof FullEntityHistoryItem) {
				entities = this.updateWithFullEntity(item, entities);
			}
		}
		return entities;
	}

	private updateWithTagChange(historyItem: TagChangeHistoryItem, entities: Map<number, Entity>): Map<number, Entity> {
		const entity: Entity = entities
				.get(historyItem.tag.entity)
				.updateTag(historyItem.tag.tag, historyItem.tag.value);
		return entities.set(entity.id, entity);
	}

	private updateWithShowEntity(historyItem: ShowEntityHistoryItem, entities: Map<number, Entity>): Map<number, Entity> {
		// No default creation - if the entity is not registered yet, it's a bug
		const entity: Entity = entities
				.get(historyItem.entityDefintion.id)
				.update(historyItem.entityDefintion);
		return entities.set(entity.id, entity);
	}

	private updateWithFullEntity(historyItem: FullEntityHistoryItem, entities: Map<number, Entity>): Map<number, Entity> {
		// No default creation - if the entity is not registered yet, it's a bug
		const entity: Entity = entities
				.get(historyItem.entityDefintion.id)
				.update(historyItem.entityDefintion);
		return entities.set(entity.id, entity);
	}
}
