import { Parser } from "./parser";
import { HistoryItem } from "../../../models/history/history-item";
import { Action } from "../../../models/action/action";
import { AllCardsService } from "../../all-cards.service";
import { Entity } from "../../../models/game/entity";
import { Map } from "immutable";
import { GameTag } from "../../../models/enums/game-tags";
import { Zone } from "../../../models/enums/zone";
import { ActionHelper } from "./action-helper";
import { uniq } from "lodash";
import { TagChangeHistoryItem } from "../../../models/history/tag-change-history-item";
import { AttachingEnchantmentAction } from "../../../models/action/attaching-enchantment-action";

export class AttachingEnchantmentParser implements Parser {

    constructor(private allCards: AllCardsService) {}

    public applies(item: HistoryItem): boolean {
        return item instanceof TagChangeHistoryItem
                && item.tag.tag === GameTag.ZONE
                && item.tag.value === Zone.PLAY;
    }

    public parse(
            item: TagChangeHistoryItem, 
            currentTurn: number, 
            entitiesBeforeAction: Map<number, Entity>,
            history: ReadonlyArray<HistoryItem>): Action[] {
        const entityId = item.tag.entity;
        const entity = entitiesBeforeAction.get(entityId);
        const attachedToEntityId = entity.getTag(GameTag.ATTACHED);
        if (!attachedToEntityId) {
            return;
        }
        if (attachedToEntityId === 2) {
            console.log('enchanting a player', item);
        }
        const creatorId = entity.getTag(GameTag.CREATOR);
        
        return [AttachingEnchantmentAction.create(
            {
                timestamp: item.timestamp,
                index: item.index,
                creatorId: creatorId,
                // Enchantments with the same name are duplicated so we have a 1-1 mapping 
                // with the card that is enchanted
                enchantmentCardId: entity.cardID,
                targetIds: [attachedToEntityId],
            },
            this.allCards)];
    }

    public reduce(actions: ReadonlyArray<Action>): ReadonlyArray<Action> {
        return ActionHelper.combineActions<AttachingEnchantmentAction>(
            actions,
            (previous, current) => this.shouldMergeActions(previous, current),
            (previous, current) => this.mergeActions(previous, current)
        );
    }

    private shouldMergeActions(previousAction: Action, currentAction: Action): boolean {
        if (!(previousAction instanceof AttachingEnchantmentAction) || !(currentAction instanceof AttachingEnchantmentAction)) {
            return false;
        }
        if ((previousAction as AttachingEnchantmentAction).creatorId !== (currentAction as AttachingEnchantmentAction).creatorId) {
            return false;
        }
        if ((previousAction as AttachingEnchantmentAction).enchantmentCardId !== (currentAction as AttachingEnchantmentAction).enchantmentCardId) {
            return false;
        }
        return true;
    }

    private mergeActions(previousAction: AttachingEnchantmentAction, currentAction: AttachingEnchantmentAction): AttachingEnchantmentAction {
        return AttachingEnchantmentAction.create(
            {
                timestamp: previousAction.timestamp,
                index: previousAction.index,
                entities: currentAction.entities,
                creatorId: currentAction.creatorId,
                enchantmentCardId: currentAction.enchantmentCardId,
                targetIds: uniq([...uniq(previousAction.targetIds || []), ...uniq(currentAction.targetIds || [])]),
            },
            this.allCards)
    }
}