import { Parser } from "./parser";
import { HistoryItem } from "../../../models/history/history-item";
import { ActionHistoryItem } from "../../../models/history/action-history-item";
import { Game } from "../../../models/game/game";
import { Action } from "../../../models/action/action";
import { TagChangeHistoryItem } from "../../../models/history/tag-change-history-item";
import { GameTag } from "../../../models/enums/game-tags";
import { Zone } from "../../../models/enums/zone";
import { CardDrawAction } from "../../../models/action/card-draw-action";
import { ActionHelper } from "./action-helper";
import { AllCardsService } from "../../all-cards.service";

export class CardDrawParser implements Parser {

    constructor(private allCards: AllCardsService) {}

    public applies(item: HistoryItem): boolean {
        return item instanceof TagChangeHistoryItem || item instanceof ActionHistoryItem;
    }

    public parse(item: TagChangeHistoryItem | ActionHistoryItem, game: Game, currentTurn: number): Action[] {
        if (currentTurn == 0) {
            return;
        }

        // We typically get a TagChange when the card is hidden, so typically when our opponent draws a card
        if (item instanceof TagChangeHistoryItem) {
            if (item.tag.tag == GameTag.ZONE && item.tag.value == Zone.HAND) {
                return [CardDrawAction.create(
                    {
                        timestamp: item.timestamp,
                        index: item.index,
                        data: [item.tag.entity],
                    },
                    this.allCards)];
            }
        }
        // Otherwise when we draw a card it's a ShowEntity or FullEntity
        if (item instanceof ActionHistoryItem) {
            return (item.node.showEntities || item.node.fullEntities || [])
                    .filter((entity) => entity.tags.get(GameTag[GameTag.ZONE]) == 3)
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
        return actions;
    }
}