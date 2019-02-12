import { Parser } from "./parser";
import { HistoryItem } from "../../../models/history/history-item";
import { ActionHistoryItem } from "../../../models/history/action-history-item";
import { Action } from "../../../models/action/action";
import { AllCardsService } from "../../all-cards.service";
import { BlockType } from "../../../models/enums/block-type";
import { Entity } from "../../../models/game/entity";
import { Map } from "immutable";
import { uniq } from "lodash";
import { MetaData } from "../../../models/parser/metadata";
import { MetaTags } from "../../../models/enums/meta-tags";
import { Info } from "../../../models/parser/info";
import { GameTag } from "../../../models/enums/game-tags";
import { CardType } from "../../../models/enums/card-type";
import { PowerTargetAction } from "../../../models/action/power-target-action";
import { ActionHelper } from "./action-helper";

export class PowerTargetParser implements Parser {

    constructor(private allCards: AllCardsService) {}

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

    public reduce(actions: ReadonlyArray<Action>): ReadonlyArray<Action> {
        return ActionHelper.combineActions<PowerTargetAction>(
            actions,
            (previous, current) => this.shouldMergeActions(previous, current),
            (previous, current) => this.mergeActions(previous, current)
        );
    }

    private shouldMergeActions(previousAction: Action, currentAction: Action): boolean {
        if (!(previousAction instanceof PowerTargetAction) || !(currentAction instanceof PowerTargetAction)) {
            return false;
        }
        if ((previousAction as PowerTargetAction).origin !== (currentAction as PowerTargetAction).origin) {
            return false;
        }
        return true;
    }

    private mergeActions(previousAction: PowerTargetAction, currentAction: PowerTargetAction): PowerTargetAction {
        return PowerTargetAction.create(
            {
                timestamp: previousAction.timestamp,
                index: previousAction.index,
                entities: currentAction.entities,
                origin: currentAction.origin,
                targets: uniq([...uniq(previousAction.targets || []), ...uniq(currentAction.targets || [])])
            },
            this.allCards)
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
                index: item.index,
                origin: entityId,
                targets: [target]
            },
            this.allCards)];
    }
}