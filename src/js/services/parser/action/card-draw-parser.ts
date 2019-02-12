import { Parser } from "./parser";
import { HistoryItem } from "../../../models/history/history-item";
import { ActionHistoryItem } from "../../../models/history/action-history-item";
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

export class CardDrawParser implements Parser {

    constructor(private allCards: AllCardsService) {}

    public applies(item: HistoryItem): boolean {
        return item instanceof TagChangeHistoryItem || item instanceof ActionHistoryItem || item instanceof ShowEntityHistoryItem;
    }

    public parse(
            item: TagChangeHistoryItem | ActionHistoryItem | ShowEntityHistoryItem, 
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
                    && (previousZone === Zone.DECK || !previousZone)) {
                return [CardDrawAction.create(
                    {
                        timestamp: item.timestamp,
                        index: item.index,
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
                return [CardDrawAction.create(
                    {
                        timestamp: item.timestamp,
                        index: item.index,
                        data: [item.entityDefintion.id],
                    },
                    this.allCards)];
            }
        }
        // Otherwise when we draw a card it's a ShowEntity or FullEntity
        if (item instanceof ActionHistoryItem) {
            return (item.node.showEntities || item.node.fullEntities || [])
                    .filter((entity) => entity.tags.get(GameTag[GameTag.ZONE]) == 3)
                    .filter((entity) => {
                        const previousZone = entitiesBeforeAction.get(entity.id).getTag(GameTag.ZONE);
                        return (previousZone === Zone.DECK || !previousZone);
                    })
                    .map((entity) => {
                        return CardDrawAction.create(
                            {
                                timestamp: item.timestamp,
                                index: entity.index,
                                data: [entity.id],
                            },
                            this.allCards);
                    });
        }
        
        return null;
    }

    public reduce(actions: ReadonlyArray<Action>): ReadonlyArray<Action> {
        return ActionHelper.combineActions<CardDrawAction>(
            actions,
            (previous, current) => previous instanceof CardDrawAction && current instanceof CardDrawAction,
            (previous, current) => this.mergeActions(previous, current)
        );
    }

    private mergeActions(previousAction: CardDrawAction, currentAction: CardDrawAction): CardDrawAction {
        return CardDrawAction.create(
            {
                timestamp: previousAction.timestamp,
                index: previousAction.index,
                entities: currentAction.entities,
                data: uniq([...uniq(previousAction.data || []), ...uniq(currentAction.data || [])]),
            },
            this.allCards)
    }
}