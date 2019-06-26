import { Parser } from "./parser";
import { HistoryItem } from "../../../models/history/history-item";
import { ActionHistoryItem } from "../../../models/history/action-history-item";
import { Action } from "../../../models/action/action";
import { AllCardsService } from "../../all-cards.service";
import { BlockType } from "../../../models/enums/block-type";
import { Entity } from "../../../models/game/entity";
import { Map } from "immutable";
import { AttackAction } from "../../../models/action/attack-action";
import { ActionHelper } from "./action-helper";
import { GameTag } from "../../../models/enums/game-tags";

export class AttackParser implements Parser {

    constructor(private allCards: AllCardsService) {}

    public applies(item: HistoryItem): boolean {
        return item instanceof ActionHistoryItem;
    }

    public parse(
            item: ActionHistoryItem, 
            currentTurn: number, 
            entitiesBeforeAction: Map<number, Entity>,
            history: ReadonlyArray<HistoryItem>): Action[] {
        if (parseInt(item.node.attributes.type) !== BlockType.ATTACK) {
            return;
        }
        let target = parseInt(item.node.attributes.target)
        if (!target) {
            console.warn('Could not parse target entity id', item);
            target = ActionHelper.getTag(item.node.tags, GameTag.PROPOSED_DEFENDER);
        }
        return [AttackAction.create(
            {
                timestamp: item.timestamp,
                index: item.index,
                originId: parseInt(item.node.attributes.entity),
                targetId: target
            },
            this.allCards)];
    }

    public reduce(actions: ReadonlyArray<Action>): ReadonlyArray<Action> {
        return actions;
    }
}