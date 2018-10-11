import { Injectable } from '@angular/core';
import { Map } from "immutable";
import { HistoryItem } from '../models/history/history-item';
import { TagChangeHistoryItem } from '../models/history/tag-change-history-item';
import { GameTag } from '../models/enums/game-tags';
import { Game } from '../models/game/game';
import { Turn } from '../models/game/turn';
import { PlayerEntity } from '../models/game/player-entity';
import { MulliganTurn } from '../models/game/mulligan-turn';
import { ActionTurn } from '../models/game/action-turn';
import { ActionHistoryItem } from '../models/history/action-history-item';
import { CardType } from '../models/enums/card-type';
import { Action } from '../models/action/action';
import { MulliganCardAction } from '../models/action/mulligan-card-action';
import { Zone } from '../models/enums/zone';
import { CardDrawAction } from '../models/action/card-draw-action';
import { EntityDefinition } from '../models/parser/entity-definition';

@Injectable()
export class ActionParserService {

    private currentTurn: number = 0;

	public parseActions(game: Game, history: ReadonlyArray<HistoryItem>): Map<number, Turn> {
        this.currentTurn = 0;
        let actionsForTurn: ReadonlyArray<Action> = [];
        let turns: Map<number, Turn> = Map<number, Turn>();
        
        const allActions = [
            [   (actionItem) => actionItem instanceof ActionHistoryItem, 
                (actionItem) => this.parseMulliganCards(actionItem, game)],
            [   (actionItem) => actionItem instanceof TagChangeHistoryItem || actionItem instanceof ActionHistoryItem, 
                (actionItem) => this.parseCardDraw(actionItem, game)],
        ];

        for (const item of history) {
            const updatedTurn: Turn = this.updateCurrentTurn(item, game, actionsForTurn);
            if (updatedTurn) {
                turns = turns.set(updatedTurn.turn == 'mulligan' ? 0 : parseInt(updatedTurn.turn), updatedTurn);
                actionsForTurn = [];
            }

            allActions.forEach((actionElements) => {
                const predicate = actionElements[0];
                if (predicate(item)) {
                    const actions: Action[] = actionElements[1](item) as Action[];
                    if (actions && actions.length > 0) {
                        actionsForTurn = [...actionsForTurn, ...actions];
                    }
                }
            });

            // TODO: add last actions to the final result
        }
        actionsForTurn = [];

        return turns;
    }

    private parseMulliganCards(item: ActionHistoryItem, game: Game): Action[] {
        if (this.currentTurn > 0) {
            return;
        }
        // Adding the cards mulliganed by the player
        if (parseInt(item.node.attributes.type) == CardType.ABILITY 
                && item.node.hideEntities
                && this.isPlayerEntity(parseInt(item.node.attributes.entity), game)) {
            return [MulliganCardAction.create({
                timestamp: item.timestamp,
                index: item.index,
                playerMulligan: item.node.hideEntities
            })];
        }
        // TODO: Opponent mulligan
        return null;
    }

    private parseCardDraw(item: TagChangeHistoryItem | ActionHistoryItem, game: Game): Action[] {
        if (this.currentTurn == 0) {
            return;
        }

        // We typically get a TagChange when the card is hidden, so typically when our opponent draws a card
        if (item instanceof TagChangeHistoryItem) {
            if (item.tag.tag == GameTag.ZONE && item.tag.value == Zone.HAND) {
                return [CardDrawAction.create({
                    timestamp: item.timestamp,
                    index: item.index,
                    data: [item.tag.entity],
                })];
            }
        }
        // Otherwise when we draw a card it's a ShowEntity or FullEntity
        if (item instanceof ActionHistoryItem) {
            // console.log('parsing card draw', item);
            return (item.node.showEntities || item.node.fullEntities || [])
                    // .map((entity) => { console.log("\t", entity); return entity; })
                    .filter((entity) => entity.tags.get(GameTag[GameTag.ZONE]) == 3)
                    .map((entity) => {
                        return CardDrawAction.create({
                            timestamp: item.timestamp,
                            index: entity.index,
                            data: [entity.id],
                        });
                    });
        }
        
        return null;
    }
    
    private updateCurrentTurn(item: HistoryItem, game: Game, actions: ReadonlyArray<Action>): Turn {
        if (item instanceof TagChangeHistoryItem 
                && this.isGameEntity(item.tag.entity, game)
                && item.tag.tag == GameTag.TURN) {
            let turnToUpdate: Turn = game.turns.get(this.currentTurn);
            if (!turnToUpdate) {
                console.warn('could not find turn to update', item, this.currentTurn, game.turns.toJS());
            }
            turnToUpdate = turnToUpdate.update({ actions: actions });
            this.currentTurn = item.tag.value - 1;
            return turnToUpdate;
        }
        return null;
    }

    private isPlayerEntity(entityId: number, game: Game) {
        return game.entities.get(entityId) instanceof PlayerEntity;
    }

    private isGameEntity(entityId: number, game: Game) {
        return entityId == 1;
    }

}
