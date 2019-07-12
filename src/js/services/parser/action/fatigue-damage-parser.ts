import { Parser } from "./parser";
import { HistoryItem } from "../../../models/history/history-item";
import { Action } from "../../../models/action/action";
import { AllCardsService } from "../../all-cards.service";
import { Entity } from "../../../models/game/entity";
import { Map } from "immutable";
import { GameTag } from "../../../models/enums/game-tags";
import { NGXLogger } from "ngx-logger";
import { TagChangeHistoryItem } from "../../../models/history/tag-change-history-item";
import { FatigueDamageAction } from "../../../models/action/fatigue-damage-action";

export class FatigueDamageParser implements Parser {

    constructor(private allCards: AllCardsService, private logger: NGXLogger) {}

    public applies(item: HistoryItem): boolean {
        return item instanceof TagChangeHistoryItem
                && item.tag.tag === GameTag.FATIGUE;
    }

    public parse(
            item: TagChangeHistoryItem, 
            currentTurn: number, 
            entitiesBeforeAction: Map<number, Entity>,
            history: ReadonlyArray<HistoryItem>): Action[] {
        return [FatigueDamageAction.create({
            timestamp: item.timestamp,
            index: item.index,
            controller: item.tag.entity,
            amount: item.tag.value
        }, this.allCards)];
    }   

    public reduce(actions: ReadonlyArray<Action>): ReadonlyArray<Action> {
        return actions;
    }
}