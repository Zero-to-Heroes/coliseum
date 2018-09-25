import { Injectable } from '@angular/core';
import { Map } from "immutable";
import { Game } from '../models/game';
import { HistoryItem } from '../models/history-item';
import { Entity } from '../models/entity';
import { PlayerHistoryItem } from '../models/player-history-item';
import { GameHistoryItem } from '../models/game-history-item';
import { FullEntityHistoryItem } from '../models/full-entity-history-item';
import { TagChangeHistoryItem } from '../models/tag-change-history-item';
import { EntityDefinition } from '../models/entity-definition';
import { ShowEntityHistoryItem } from '../models/show-entity-history-item';
import { GameTag } from '../models/game-tags';
import { AllCardsService } from './all-cards.service';
import { CardType } from '../models/card-type';

@Injectable()
export class GameInitializerService {

    // Map of entityId - entity definition
    private entities: Map<number, Entity>;

    constructor(private allCards: AllCardsService) {

    }

	public initGameWithPlayers(history: ReadonlyArray<HistoryItem>): Game {
        const start = Date.now();
        this.entities = Map();
        const game: Game = Game.createGame({} as Game);
        this.initializeEntities(history);
        console.debug('[perf] Initializing entities done after ', (Date.now() - start), 'ms');
        this.completeMissingInformation(history);
        console.debug('[perf] Completing missing history done after ', (Date.now() - start), 'ms');
        this.addBasicData();
        console.debug('[perf] Adding basic data done after ', (Date.now() - start), 'ms');
        console.log('initialized entties', this.entities.toJS());
        return null;
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
        const entity: Entity = Entity
                .create({ id: historyItem.entityDefintion.id } as Entity)
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
        historyItem.entityDefintion.tags.ZONE = 6;
        const entity: Entity = this.entities
                .get(historyItem.entityDefintion.id, Entity.create({ id: historyItem.entityDefintion.id } as Entity))
                .update(historyItem.entityDefintion);
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
                    .update({ tags: { [item.tag.tag.toString()]: 1} });
            this.entities = this.entities.set(entity.id, entity);
        }
        else if (item.tag.tag === GameTag.QUEST && item.tag.value === 1) {
            const entity: Entity = this.entities
                    .get(item.tag.entity)
                    .update({ tags: { [item.tag.tag.toString()]: 1} });
            this.entities = this.entities.set(entity.id, entity);
        }
        else if (item.tag.tag === GameTag.PARENT_CARD) {
            const entity: Entity = this.entities
                    .get(item.tag.entity)
                    .update({ tags: { [item.tag.tag.toString()]: item.tag.value} });
            this.entities = this.entities.set(entity.id, entity);
        }
    }
    
    private addEntityInformation(item: ShowEntityHistoryItem) {
        if (item.entityDefintion.tags.SECRET == 1) {
            const entity: Entity = this.entities
                    .get(item.entityDefintion.id)
                    .update({ tags: { 'SECRET': 1} });
            this.entities = this.entities.set(entity.id, entity);
        }
        const entity: Entity = this.entities
                .get(item.entityDefintion.id)
                .update({ tags: { 
                    'CREATOR': item.entityDefintion.tags.CREATOR,
                    'TAG_SCRIPT_DATA_NUM_1': item.entityDefintion.tags.TAG_SCRIPT_DATA_NUM_1,
                    'TAG_SCRIPT_DATA_NUM_2': item.entityDefintion.tags.TAG_SCRIPT_DATA_NUM_2,
                } });
        this.entities = this.entities.set(entity.id, entity);
    }

    private addBasicData() {
        this.entities = this.entities.map((value: Entity) => {
            const card = this.allCards.getCard(value.cardID);
            let newTags = Map();
            if (card) {
                if (card.type == 'Spell' && !value.tags.get(GameTag.CARDTYPE.toString())) {
                    newTags = value.tags.set(GameTag.CARDTYPE.toString(), CardType.SPELL);
                }
                if (card.type == 'Enchantment' && !value.tags.get(GameTag.CARDTYPE.toString())) {
                    newTags = value.tags.set(GameTag.CARDTYPE.toString(), CardType.ENCHANTMENT);
                }
            }
            return Entity.create(value, { tags: newTags });
        }).toMap();
    }

    // private initializeTagChange(historyItem: TagChangeHistoryItem) {
    //     const tags = { };
    //     tags[historyItem.tag.tag] = historyItem.tag.value;
    //     const entity: Entity = this.entities
    //             .get(historyItem.tag.entity, Entity.create({ id: historyItem.tag.entity } as Entity))
    //             .update({ tags } as EntityDefinition)
    //     this.entities = this.entities.set(entity.id, entity);
    // }
}
