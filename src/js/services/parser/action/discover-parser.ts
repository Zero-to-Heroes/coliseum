import { Parser } from "./parser";
import { HistoryItem } from "../../../models/history/history-item";
import { Action } from "../../../models/action/action";
import { AllCardsService } from "../../all-cards.service";
import { Entity } from "../../../models/game/entity";
import { Map } from "immutable";
import { ChoicesHistoryItem } from "../../../models/history/choices-history-item";
import { ChoiceType } from "../../../models/enums/choice-type";
import { DiscoverAction } from "../../../models/action/discover-action";

export class DiscoverParser implements Parser {

    constructor(private allCards: AllCardsService) {}

    public applies(item: HistoryItem): boolean {
        return item instanceof ChoicesHistoryItem;
    }

    public parse(
            item: ChoicesHistoryItem, 
            currentTurn: number, 
            entitiesBeforeAction: Map<number, Entity>,
            history: ReadonlyArray<HistoryItem>): Action[] {
        if (item.choices.type !== ChoiceType.GENERAL) {
            return [];
        }
        return [DiscoverAction.create(
            {
                timestamp: item.timestamp,
                index: item.index,
                origin: item.choices.source,
                ownerId: item.choices.playerID,
                choices: item.choices.cards
            },
            this.allCards)];
    }

    public reduce(actions: ReadonlyArray<Action>): ReadonlyArray<Action> {
        return actions;
    }
}