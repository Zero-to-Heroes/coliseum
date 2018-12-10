import { Injectable } from '@angular/core';
import { HistoryItem } from '../../models/history/history-item';
import { Map } from 'immutable';
import { Turn } from '../../models/game/turn';
import { Game } from '../../models/game/game';
import { EntityDefinition } from '../../models/parser/entity-definition';
import { Action } from '../../models/action/action';
import { TagChangeHistoryItem } from '../../models/history/tag-change-history-item';
import { Entity } from '../../models/game/entity';
import { GameTag } from '../../models/enums/game-tags';
import { ShowEntityHistoryItem } from '../../models/history/show-entity-history-item';
import { FullEntityHistoryItem } from '../../models/history/full-entity-history-item';
import { ChangeEntityHistoryItem } from '../../models/history/change-entity-history-item';

@Injectable()
export class StateProcessorService {

    private readonly USEFUL_TAGS: ReadonlyArray<GameTag> = [
        GameTag.TAG_SCRIPT_DATA_NUM_1,
        GameTag.TAG_SCRIPT_DATA_NUM_2,
        GameTag.PREMIUM,
        GameTag.STEP,
        GameTag.TURN,
        GameTag.HERO_ENTITY,
        GameTag.PLAYER_ID,
        GameTag.DAMAGE,
        GameTag.HEALTH,
        GameTag.ATK,
        GameTag.COST,
        GameTag.ZONE,
        GameTag.CONTROLLER,
        GameTag.DURABILITY,
        GameTag.CARDTYPE,
        GameTag.SECRET,
        GameTag.ZONE_POSITION,
        GameTag.MULLIGAN_STATE,
        GameTag.CREATOR,
        GameTag.PARENT_CARD,
        GameTag.QUEST,
    ];
    
	public populateIntermediateStates(game: Game, history: ReadonlyArray<HistoryItem>): Game {
        let previousStateEntities: Map<number, Entity> = game.entities;
        let currentActionIndexInTurn = 0;
        let currentTurnIndex = 0;
        let turnsWithActions = game.turns;
        let currentAction: Action = turnsWithActions.get(currentTurnIndex).actions[currentActionIndexInTurn];
        for (const item of history) {
            if (!item.index) {
                console.error('No index in item', item);
            }
            if (item.index <= currentAction.index) {
                previousStateEntities = this.applyHistory(previousStateEntities, item);
            }
            else {
                const newAction = currentAction.update(previousStateEntities);
                const newActions = [...turnsWithActions.get(currentTurnIndex).actions];
                newActions[currentActionIndexInTurn] = newAction;
                const readonlyNewActions: ReadonlyArray<Action> = [...newActions];
                const newTurn = turnsWithActions.get(currentTurnIndex).update({ actions: readonlyNewActions });
                turnsWithActions = turnsWithActions.set(currentTurnIndex, newTurn);

                currentActionIndexInTurn++;
                if (currentActionIndexInTurn >= turnsWithActions.get(currentTurnIndex).actions.length) {
                    currentActionIndexInTurn = 0;
                    currentTurnIndex++;
                    if (currentTurnIndex >= turnsWithActions.toArray().length) {
                        break;
                    }
                }
                currentAction = turnsWithActions.get(currentTurnIndex).actions[currentActionIndexInTurn];
            }
        }
        return Game.createGame(game, { turns: turnsWithActions });;
	}

    private applyHistory(entities: Map<number, Entity>, item: HistoryItem): Map<number, Entity> {
        if (item instanceof TagChangeHistoryItem) {
            return this.updateWithTagChange(item, entities)
        }
        else if (item instanceof ShowEntityHistoryItem || item instanceof FullEntityHistoryItem) {
            return this.updateWithEntity(item, entities);
        }
        else if (item instanceof ChangeEntityHistoryItem) {
            console.warn('Change entity update not implemented yet', item);
            // return this.updateWithChangeEntity(item, entities);
        }
        return entities;
        // TODO: options, choices, chosen entities
    }

    private updateWithEntity(historyItem: ShowEntityHistoryItem | FullEntityHistoryItem, entities: Map<number, Entity>): Map<number, Entity> {
        const entity: Entity = entities
                .get(historyItem.entityDefintion.id)
                .update(historyItem.entityDefintion);
        return entities.set(entity.id, entity);
    }

    private updateWithTagChange(historyItem: TagChangeHistoryItem, entities: Map<number, Entity>): Map<number, Entity> {
        // Only a limited number of tags are useful for replay reconstitution. If the tag isn't 
        // one of them, we simply ignore it. Thanks to this, we will have less differences 
        // between our entities, which will improve the memory footprint and performances
        if (this.USEFUL_TAGS.indexOf(historyItem.tag.tag) === -1) {
            return entities;
        }
        // No default creation - if the entity is not registered yet, it's a bug
        const entity: Entity = entities
                .get(historyItem.tag.entity)
                .updateTag(historyItem.tag.tag, historyItem.tag.value);
        return entities.set(entity.id, entity);
    }
}
