import { Parser } from "./parser";
import { HistoryItem } from "../../../models/history/history-item";
import { ActionHistoryItem } from "../../../models/history/action-history-item";
import { Action } from "../../../models/action/action";
import { AllCardsService } from "../../all-cards.service";
import { BlockType } from "../../../models/enums/block-type";
import { Entity } from "../../../models/game/entity";
import { Map } from "immutable";
import { uniq, isEqual } from "lodash";
import { PowerTargetAction } from "../../../models/action/power-target-action";
import { ActionHelper } from "./action-helper";
import { CardTargetAction } from "../../../models/action/card-target-action";
import { AttachingEnchantmentAction } from "../../../models/action/attaching-enchantment-action";
import { NGXLogger } from "ngx-logger";

export class CardTargetParser implements Parser {

    constructor(private allCards: AllCardsService, private logger: NGXLogger) {}

    public applies(item: HistoryItem): boolean {
        return item instanceof ActionHistoryItem;
    }

    public parse(
            item: ActionHistoryItem, 
            currentTurn: number, 
            entitiesBeforeAction: Map<number, Entity>,
            history: ReadonlyArray<HistoryItem>): Action[] {

        if (parseInt(item.node.attributes.type) !== BlockType.POWER && parseInt(item.node.attributes.type) !== BlockType.TRIGGER) {
            return;
        }
        const targetId = parseInt(item.node.attributes.target);
        if (targetId > 0) {
            return [CardTargetAction.create(
                {
                    timestamp: item.timestamp,
                    index: item.index,
                    origin: parseInt(item.node.attributes.entity),
                    targets: [targetId]
                },
                this.allCards)];
        }
        return [];
    }

    public reduce(actions: ReadonlyArray<Action>): ReadonlyArray<Action> {
        return ActionHelper.combineActions<CardTargetAction | AttachingEnchantmentAction>(
            actions,
            (previous, current) => this.shouldMergeActions(previous, current),
            (previous, current) => this.mergeActions(previous, current)
        );
    }

    private shouldMergeActions(previousAction: Action, currentAction: Action): boolean {
        if (previousAction instanceof CardTargetAction && currentAction instanceof CardTargetAction) {
            if ((previousAction as CardTargetAction).origin === (currentAction as CardTargetAction).origin) {
                return true;
            }
        }
        if (previousAction instanceof AttachingEnchantmentAction && currentAction instanceof CardTargetAction) {
            if (previousAction.creatorId === currentAction.origin 
                        && isEqual(previousAction.targetIds, currentAction.targets)) {
                return true;
            }
        }
        return false;
    }

    private mergeActions(
            previousAction: CardTargetAction | AttachingEnchantmentAction, 
            currentAction: CardTargetAction | AttachingEnchantmentAction): CardTargetAction | AttachingEnchantmentAction {
        if (currentAction instanceof AttachingEnchantmentAction) {
            this.logger.error('incorrect AttachingEnchantmentAction as current action for card-target-parser', currentAction);
            return;
        }
        if (previousAction instanceof CardTargetAction) {
            return CardTargetAction.create(
                {
                    timestamp: previousAction.timestamp,
                    index: previousAction.index,
                    entities: currentAction.entities,
                    origin: currentAction.origin,
                    targets: uniq([...uniq(previousAction.targets || []), ...uniq(currentAction.targets || [])])
                },
                this.allCards)
        }
        else if (previousAction instanceof AttachingEnchantmentAction) {
            return previousAction;
        }
    }
}