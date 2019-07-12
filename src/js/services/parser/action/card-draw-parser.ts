import { Parser } from "./parser";
import { HistoryItem } from "../../../models/history/history-item";
import { Action } from "../../../models/action/action";
import { TagChangeHistoryItem } from "../../../models/history/tag-change-history-item";
import { GameTag } from "../../../models/enums/game-tags";
import { Zone } from "../../../models/enums/zone";
import { CardDrawAction } from "../../../models/action/card-draw-action";
import { AllCardsService } from "../../all-cards.service";
import { Entity } from "../../../models/game/entity";
import { Map } from "immutable";
import { ShowEntityHistoryItem } from "../../../models/history/show-entity-history-item";
import { uniq } from 'lodash';
import { ActionHelper } from "./action-helper";
import { NGXLogger } from "ngx-logger";
import { FullEntityHistoryItem } from "../../../models/history/full-entity-history-item";

export class CardDrawParser implements Parser {

    constructor(private allCards: AllCardsService, private logger: NGXLogger) {}

    public applies(item: HistoryItem): boolean {
        return item instanceof TagChangeHistoryItem || item instanceof FullEntityHistoryItem || item instanceof ShowEntityHistoryItem;
    }

    public parse(
            item: TagChangeHistoryItem | FullEntityHistoryItem | ShowEntityHistoryItem, 
            currentTurn: number, 
            entitiesBeforeAction: Map<number, Entity>,
            history: ReadonlyArray<HistoryItem>): Action[] {
        if (currentTurn == 0) {
            return;
        }

        // We typically get a TagChange when the card is hidden, so typically when our opponent draws a card
        if (item instanceof TagChangeHistoryItem) {
            const previousZone = entitiesBeforeAction.get(item.tag.entity).getTag(GameTag.ZONE);
            if (item.tag.tag == GameTag.ZONE 
                    && item.tag.value == Zone.HAND 
                    // SETASIDE is for discovery actions
                    && (previousZone === Zone.DECK || previousZone === Zone.SETASIDE || !previousZone)) {
                const controller = entitiesBeforeAction.get(item.tag.entity).getTag(GameTag.CONTROLLER);
                if (!controller) {
                    this.logger.error('[card-draw-parser] empty controller', item, entitiesBeforeAction.get(item.tag.entity));
                }
                return [CardDrawAction.create(
                    {
                        timestamp: item.timestamp,
                        index: item.index,
                        controller: controller,
                        data: [item.tag.entity],
                    },
                    this.allCards)];
            }
        }
        // ShowEntity also happens, for instance when you draw a card with Life Tap
        if (item instanceof ShowEntityHistoryItem) {
            const previousZone = entitiesBeforeAction.get(item.entityDefintion.id).getTag(GameTag.ZONE);
            if (item.entityDefintion.tags.get(GameTag[GameTag.ZONE]) === Zone.HAND 
                    && (previousZone === Zone.DECK || !previousZone)) {
                const controller = entitiesBeforeAction.get(item.entityDefintion.id).getTag(GameTag.CONTROLLER);
                if (!controller) {
                    this.logger.error('empty controller', item, entitiesBeforeAction.get(item.entityDefintion.id));
                }
                return [CardDrawAction.create(
                    {
                        timestamp: item.timestamp,
                        index: item.index,
                        controller: controller,
                        data: [item.entityDefintion.id],
                    },
                    this.allCards)];
            }
        }
        // Otherwise when we draw a card it's a ShowEntity or FullEntity
        if (item instanceof FullEntityHistoryItem) {
            const zone = item.entityDefintion.tags.get(GameTag[GameTag.ZONE])
            if (zone !== Zone.HAND) {
                return [];
            }
            const previousZone = entitiesBeforeAction.get(item.entityDefintion.id).getTag(GameTag.ZONE);
            if (previousZone && previousZone !== Zone.DECK) {
                return;
            }
            const controller = item.entityDefintion.tags.get(GameTag[GameTag.CONTROLLER]) 
                    || entitiesBeforeAction.get(item.entityDefintion.id).getTag(GameTag.CONTROLLER);
            if (!controller) {
                this.logger.error('[card-draw-parser] empty controller', item);
                return [];
            }
            return [CardDrawAction.create(
                {
                    timestamp: item.timestamp,
                    index: item.index,
                    controller: controller,
                    data: [item.entityDefintion.id],
                },
                this.allCards)];
        }
        
        return [];
    }

    public reduce(actions: ReadonlyArray<Action>): ReadonlyArray<Action> {
        return ActionHelper.combineActions<CardDrawAction>(
            actions,
            (previous, current) => this.shouldMergeActions(previous, current),
            (previous, current) => this.mergeActions(previous, current)
        );
    }

    private shouldMergeActions(previous: Action, current: Action): boolean {
        if (!(previous instanceof CardDrawAction && current instanceof CardDrawAction)) {
            return false;
        }
        if (previous.controller === undefined || current.controller === undefined) {
            this.logger.error('[card-draw-parser] Empty controller for draw action', previous, current);
        }
        return previous.controller === current.controller;
    }

    private mergeActions(previousAction: CardDrawAction, currentAction: CardDrawAction): CardDrawAction {
        return CardDrawAction.create(
            {
                timestamp: previousAction.timestamp,
                index: currentAction.index,
                entities: currentAction.entities,
                controller: currentAction.controller,
                data: uniq([...uniq(previousAction.data || []), ...uniq(currentAction.data || [])]),
            },
            this.allCards)
    }
}