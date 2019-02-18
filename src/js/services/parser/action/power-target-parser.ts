import { Parser } from "./parser";
import { HistoryItem } from "../../../models/history/history-item";
import { ActionHistoryItem } from "../../../models/history/action-history-item";
import { Action } from "../../../models/action/action";
import { AllCardsService } from "../../all-cards.service";
import { BlockType } from "../../../models/enums/block-type";
import { Entity } from "../../../models/game/entity";
import { Map } from "immutable";
import { uniq, isEqual } from "lodash";
import { MetaData } from "../../../models/parser/metadata";
import { MetaTags } from "../../../models/enums/meta-tags";
import { Info } from "../../../models/parser/info";
import { GameTag } from "../../../models/enums/game-tags";
import { CardType } from "../../../models/enums/card-type";
import { PowerTargetAction } from "../../../models/action/power-target-action";
import { ActionHelper } from "./action-helper";
import { CardTargetAction } from "../../../models/action/card-target-action";
import { AttachingEnchantmentAction } from "../../../models/action/attaching-enchantment-action";
import { NGXLogger } from "ngx-logger";

export class PowerTargetParser implements Parser {

    constructor(private allCards: AllCardsService, private logger: NGXLogger) {}

    public applies(item: HistoryItem): boolean {
        return item instanceof ActionHistoryItem;
    }

    public parse(
            item: ActionHistoryItem, 
            currentTurn: number, 
            entitiesBeforeAction: Map<number, Entity>,
            history: ReadonlyArray<HistoryItem>): Action[] {
        if (parseInt(item.node.attributes.type) !== BlockType.POWER 
                && parseInt(item.node.attributes.type) !== BlockType.TRIGGER) {
            return;
        }
        // TODO: hard-code Malchezaar?

        if (item.node.meta && item.node.meta.length > 0) {
            for (let meta of item.node.meta) {
                if (!meta.info && !meta.meta) {
                    continue;
                }
                if (meta.meta !== MetaTags[MetaTags.TARGET]) {
                    continue;
                }
                if (meta.info) {
                    return meta.info
                            .map((info) => this.buildPowerActions(entitiesBeforeAction, item, meta, info))
                            .reduce((a, b) => a.concat(b), []);
                }
            }
        }
        return [];
    }

    private buildPowerActions(
            entities: Map<number, Entity>,
            item: ActionHistoryItem, 
            meta: MetaData, 
            info: Info): Action[] {
        const entityId = parseInt(item.node.attributes.entity);
        // Prevent a spell from targeting itself
        if (entityId === info.entity && entities.get(entityId).getTag(GameTag.CARDTYPE) === CardType.SPELL) {
            return [];
        }
        let target = info.entity;
        if (!target && parseInt(item.node.attributes.target)) {
            target = parseInt(item.node.attributes.target);
        }
        if (!target) {
            return [];
        }
        return [PowerTargetAction.create(
            {
                timestamp: item.timestamp,
                index: meta.index,
                origin: entityId,
                targets: [target]
            },
            this.allCards)];
    }

    public reduce(actions: ReadonlyArray<Action>): ReadonlyArray<Action> {
        return ActionHelper.combineActions<PowerTargetAction | AttachingEnchantmentAction>(
            actions,
            (previous, current) => this.shouldMergeActions(previous, current),
            (previous, current) => this.mergeActions(previous, current)
        );
    }

    private shouldMergeActions(previousAction: Action, currentAction: Action): boolean {
        if (previousAction instanceof PowerTargetAction && currentAction instanceof PowerTargetAction) {
            return ((previousAction as PowerTargetAction).origin === (currentAction as PowerTargetAction).origin);
        }
        // Spells that target would trigger twice otherwise
        if ((previousAction instanceof CardTargetAction) && (currentAction instanceof PowerTargetAction)) {
            return ((previousAction as CardTargetAction).origin === (currentAction as PowerTargetAction).origin);
        }
        if (previousAction instanceof AttachingEnchantmentAction && currentAction instanceof PowerTargetAction) {
            if (previousAction.creatorId === currentAction.origin 
                        && isEqual(previousAction.targetIds, currentAction.targets)) {
                return true;
            }
        }
        return false;
    }

    private mergeActions(
            previousAction: PowerTargetAction | CardTargetAction | AttachingEnchantmentAction, 
            currentAction: PowerTargetAction | AttachingEnchantmentAction): PowerTargetAction | AttachingEnchantmentAction {
        if (currentAction instanceof AttachingEnchantmentAction) {
            this.logger.error('incorrect AttachingEnchantmentAction as current action for power-target-parser', currentAction);
            return;
        }
        if (previousAction instanceof PowerTargetAction || previousAction instanceof CardTargetAction) {
            return PowerTargetAction.create(
                {
                    timestamp: previousAction.timestamp,
                    index: previousAction.index,
                    entities: currentAction.entities,
                    origin: currentAction.origin,
                    targets: uniq([...uniq(previousAction.targets || []), ...uniq(currentAction.targets || [])])
                },
                this.allCards);
        }
        else if (previousAction instanceof AttachingEnchantmentAction) {
            return previousAction;
        }
    }
}