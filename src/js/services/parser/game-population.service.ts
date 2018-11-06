import { Injectable } from '@angular/core';
import { Map, fromJS } from "immutable";
import { HistoryItem } from '../../models/history/history-item';
import { Entity } from '../../models/game/entity';
import { PlayerHistoryItem } from '../../models/history/player-history-item';
import { GameHistoryItem } from '../../models/history/game-history-item';
import { FullEntityHistoryItem } from '../../models/history/full-entity-history-item';
import { TagChangeHistoryItem } from '../../models/history/tag-change-history-item';
import { EntityDefinition } from '../../models/parser/entity-definition';
import { ShowEntityHistoryItem } from '../../models/history/show-entity-history-item';
import { GameTag } from '../../models/enums/game-tags';
import { AllCardsService } from '../all-cards.service';
import { CardType } from '../../models/enums/card-type';
import { PlayerEntity } from '../../models/game/player-entity';
import { Zone } from '../../models/enums/zone';

@Injectable()
export class GamePopulationService {

    // Map of entityId - entity definition
    private entities: Map<number, Entity>;

    constructor(private allCards: AllCardsService) {

    }

	public populateInitialEntities(history: ReadonlyArray<HistoryItem>): Map<number, Entity> {
        // const start = Date.now();
        this.entities = Map();
        this.initializeEntities(history);
        // console.log('entities after init', this.entities.toJS());
        this.completeMissingInformation(history);
        // console.log('entities after missing info', this.entities.toJS());
        this.addBasicData();
        // console.log('entities after basic data', this.entities.toJS());
        return this.entities;
    }

    private initializeEntities(history: ReadonlyArray<HistoryItem>) {
        for (const item of history) {
            if (item instanceof PlayerHistoryItem) {
                this.initializePlayer(item);
            }
            else if (item instanceof GameHistoryItem) {
                this.initializeGame(item);
            }
            else if (item instanceof FullEntityHistoryItem) {
                this.initializeFullEntity(item);
            }
            else if (item instanceof ShowEntityHistoryItem) {
                this.initializeShowEntity(item);
            }
        }
    }
    
    private initializePlayer(historyItem: PlayerHistoryItem) {
        const entity: PlayerEntity = PlayerEntity
                .create({ id: historyItem.entityDefintion.id, playerId: historyItem.entityDefintion.playerID } as PlayerEntity)
                .update(historyItem.entityDefintion);
        this.entities = this.entities.set(entity.id, entity);
    }
    
    private initializeGame(historyItem: GameHistoryItem) {
        const entity: Entity = Entity
                .create({ id: historyItem.entityDefintion.id } as Entity)
                .update(historyItem.entityDefintion);
        this.entities = this.entities.set(entity.id, entity);
    }
    
    private initializeFullEntity(historyItem: FullEntityHistoryItem) {
        // Not in the game yet
        // const newTags = historyItem.entityDefintion.tags.set(
        //         GameTag[GameTag.ZONE], 
        //         // historyItem.entityDefintion.tags.get(GameTag[GameTag.ZONE]) || Zone.SETASIDE);
        //         Zone.SETASIDE);
        const newAttributes: any = {};
        // We use the ShowEntity only to update the cardID at this stage (and register the entity to the list of all entities if need be)
        if (historyItem.entityDefintion.cardID) {
            newAttributes.cardID = historyItem.entityDefintion.cardID;
        }
        const entity: Entity = this.entities
                .get(historyItem.entityDefintion.id, Entity.create({ id: historyItem.entityDefintion.id } as Entity))
                .update(newAttributes);
                // .update({ tags: newTags});
        this.entities = this.entities.set(entity.id, entity);
    }
    
    private initializeShowEntity(historyItem: ShowEntityHistoryItem) {
        const newAttributes: any = {};
        // We use the ShowEntity only to update the cardID at this stage (and register the entity to the list of all entities if need be)
        if (historyItem.entityDefintion.cardID) {
            newAttributes.cardID = historyItem.entityDefintion.cardID;
        }
        const entity: Entity = this.entities
                .get(historyItem.entityDefintion.id, Entity.create({ id: historyItem.entityDefintion.id } as Entity))
                .update(newAttributes as EntityDefinition);
        this.entities = this.entities.set(entity.id, entity);
    }

    private completeMissingInformation(history: ReadonlyArray<HistoryItem>) {
        for (const item of history) {
            if (item instanceof TagChangeHistoryItem) {
                this.addTagInformation(item);
            }
            if (item instanceof ShowEntityHistoryItem) {
                this.addEntityInformation(item);
            }
        }
    }

    private addTagInformation(item: TagChangeHistoryItem) {
        if (item.tag.tag === GameTag.SECRET && item.tag.value === 1) {
            const entity: Entity = this.entities
                    .get(item.tag.entity)
                    .update({ tags: fromJS({ [GameTag[item.tag.tag]]: 1}) });
            this.entities = this.entities.set(entity.id, entity);
        }
        else if (item.tag.tag === GameTag.QUEST && item.tag.value === 1) {
            const entity: Entity = this.entities
                    .get(item.tag.entity)
                    .update({ tags: fromJS({ [GameTag[item.tag.tag]]: 1}) });
            this.entities = this.entities.set(entity.id, entity);
        }
        else if (item.tag.tag === GameTag.PARENT_CARD) {
            const entity: Entity = this.entities
                    .get(item.tag.entity)
                    .update({ tags: fromJS({ [GameTag[item.tag.tag]]: item.tag.value}) });
            this.entities = this.entities.set(entity.id, entity);
        }
    }
    
    private addEntityInformation(item: ShowEntityHistoryItem) {
        if (item.entityDefintion.tags.get(GameTag[GameTag.SECRET]) == 1) {
            const entity: Entity = this.entities
                    .get(item.entityDefintion.id)
                    .update({ tags: Map<string, number>().set(GameTag[GameTag.SECRET], 1) });
            this.entities = this.entities.set(entity.id, entity);
        }
        const newTags: Map<string, number> = Map<string, number>()
                .set(GameTag[GameTag.CREATOR], item.entityDefintion.tags.get(GameTag[GameTag.CREATOR]))
                .set(GameTag[GameTag.TAG_SCRIPT_DATA_NUM_1], item.entityDefintion.tags.get(GameTag[GameTag.TAG_SCRIPT_DATA_NUM_1]))
                .set(GameTag[GameTag.TAG_SCRIPT_DATA_NUM_2], item.entityDefintion.tags.get(GameTag[GameTag.TAG_SCRIPT_DATA_NUM_2]));
        const entity: Entity = this.entities
                .get(item.entityDefintion.id)
                .update({ tags: newTags });
        this.entities = this.entities.set(entity.id, entity);
    }

    private addBasicData() {
        this.entities = this.entities.map((value: Entity) => {
            const card = this.allCards.getCard(value.cardID);
            let newTags = Map<string, number>();
            if (card) {
                if (card.type == 'Spell' && !value.getTag(GameTag.CARDTYPE)) {
                    newTags = value.tags.set(GameTag[GameTag.CARDTYPE], CardType.SPELL);
                }
                if (card.type == 'Enchantment' && !value.getTag(GameTag.CARDTYPE)) {
                    newTags = value.tags.set(GameTag[GameTag.CARDTYPE], CardType.ENCHANTMENT);
                }
            }
            return value.update({ tags: newTags });
        }).toMap();
    }
}