import { Parser } from "./parser";
import { HistoryItem } from "../../../models/history/history-item";
import { ActionHistoryItem } from "../../../models/history/action-history-item";
import { Action } from "../../../models/action/action";
import { AllCardsService } from "../../all-cards.service";
import { BlockType } from "../../../models/enums/block-type";
import { Entity } from "../../../models/game/entity";
import { Map } from "immutable";
import { GameTag } from "../../../models/enums/game-tags";
import { CardType } from "../../../models/enums/card-type";
import { HeroPowerUsedAction } from "../../../models/action/hero-power-used-action";

export class HeroPowerUsedParser implements Parser {

    constructor(private allCards: AllCardsService) {}

    public applies(item: HistoryItem): boolean {
        return item instanceof ActionHistoryItem;
    }

    public parse(
            item: ActionHistoryItem, 
            currentTurn: number, 
            entitiesBeforeAction: Map<number, Entity>, 
            entitiesAfterAction: Map<number, Entity>): Action[] {
        if (parseInt(item.node.attributes.type) !== BlockType.PLAY) {
            return;
        }

        const entity = entitiesBeforeAction.get(parseInt(item.node.attributes.entity));
        if (entity.getTag(GameTag.CARDTYPE) === CardType.HERO_POWER) {
            return [HeroPowerUsedAction.create(
                {
                    timestamp: item.timestamp,
                    index: item.index,
                    entities: entitiesAfterAction,
                    entityId: entity.id,
                },
                this.allCards)];
        }
    }

    public reduce(actions: ReadonlyArray<Action>): ReadonlyArray<Action> {
        return actions;
    }
}