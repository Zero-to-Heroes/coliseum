import { Parser } from "./parser";
import { HistoryItem } from "../../../models/history/history-item";
import { Action } from "../../../models/action/action";
import { AllCardsService } from "../../all-cards.service";
import { Entity } from "../../../models/game/entity";
import { Map } from "immutable";
import { TagChangeHistoryItem } from "../../../models/history/tag-change-history-item";
import { GameTag } from "../../../models/enums/game-tags";
import { DamageAction } from "../../../models/action/damage-action";
import { Zone } from "../../../models/enums/zone";
import { AttackAction } from "../../../models/action/attack-action";
import { ActionHelper } from "./action-helper";
import { NGXLogger } from "ngx-logger";
import { HealingAction } from "../../../models/action/healing-action";
import { PowerTargetAction } from "../../../models/action/power-target-action";
import { Damage } from "../../../models/action/damage";

export class DamageParser implements Parser {

    constructor(private allCards: AllCardsService, private logger: NGXLogger) {}

    public applies(item: HistoryItem): boolean {
        return item instanceof TagChangeHistoryItem && item.tag.tag === GameTag.DAMAGE;
    }

    public parse(
            item: TagChangeHistoryItem, 
            currentTurn: number, 
            entitiesBeforeAction: Map<number, Entity>,
            history: ReadonlyArray<HistoryItem>): Action[] {
        const entity = entitiesBeforeAction.get(item.tag.entity);
        // Damage is reset to 0 after an entity dies, and we don't want to show this
        if (entity.getTag(GameTag.ZONE) !== Zone.PLAY) {
            return [];
        }
        const previousDamageTag = entity.getTag(GameTag.DAMAGE);
        const previousDamage = (!previousDamageTag || previousDamageTag === -1) ? 0 : previousDamageTag;
        const damageTaken = item.tag.value - previousDamage;
        if (damageTaken > 0) {
            return [DamageAction.create(
                {
                    timestamp: item.timestamp,
                    index: item.index,
                    damages: Map.of(item.tag.entity, damageTaken)
                } as Action,
                this.allCards)];            
        }
        else 
        if (damageTaken < 0) {
            return [HealingAction.create(
                {
                    timestamp: item.timestamp,
                    index: item.index,
                    damages: Map.of(item.tag.entity, damageTaken)
                },
                this.allCards)];            
        }
        return [];
    }

    public reduce(actions: ReadonlyArray<Action>): ReadonlyArray<Action> {
        return ActionHelper.combineActions<Action>(
            actions,
            (previous, current) => this.shouldMergeActions(previous, current),
            (previous, current) => this.mergeActions(previous, current)
        );
    }

    private shouldMergeActions(previousAction: Action, currentAction: Action): boolean {
        if (!(currentAction instanceof DamageAction)) {
            return false;
        }
        return previousAction instanceof DamageAction // Merge all damages into a single action
                || previousAction instanceof AttackAction // Add damage to the attack causing the damage
                || previousAction instanceof PowerTargetAction; // Add damages to the power causing the damage
    }

    private mergeActions(previousAction: Action, currentAction: Action): Action {
        return this.mergeDamageIntoAction(previousAction, currentAction as DamageAction);
    }

    private mergeDamageIntoAction(previousAction: Action, currentAction: DamageAction): Action {
        const result = ActionHelper.mergeIntoFirstAction(previousAction, currentAction, {
            index: currentAction.index,
            entities: currentAction.entities,
        } as Action);
        // if (previousAction instanceof PowerTargetAction) {
        //     console.log('merging damage into target action', previousAction.originId, previousAction, currentAction, result, result instanceof PowerTargetAction)
        // }
        return result;
    }
}