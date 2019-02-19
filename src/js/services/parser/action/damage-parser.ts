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
        if (previousDamage > 0) {
            return [DamageAction.create(
                {
                    timestamp: item.timestamp,
                    index: item.index,
                    damages: [{
                        entity: item.tag.entity,
                        amount: item.tag.value - previousDamage,
                    }]
                },
                this.allCards)];            
        }
        return [];
    }

    public reduce(actions: ReadonlyArray<Action>): ReadonlyArray<Action> {
        return ActionHelper.combineActions<DamageAction | AttackAction>(
            actions,
            (previous, current) => this.shouldMergeActions(previous, current),
            (previous, current) => this.mergeActions(previous, current)
        );
    }

    private shouldMergeActions(previousAction: Action, currentAction: Action): boolean {
        if (previousAction instanceof DamageAction && currentAction instanceof DamageAction) {
            return true;
        }
        if (previousAction instanceof AttackAction && currentAction instanceof DamageAction) {
            return true;
        }
        return false;
    }

    private mergeActions(
            previousAction: DamageAction | AttackAction, 
            currentAction: DamageAction | AttackAction): DamageAction | AttackAction {
        if (previousAction instanceof DamageAction && currentAction instanceof DamageAction) {
            return this.mergeDamages(previousAction, currentAction);
        }
        if (previousAction instanceof AttackAction && currentAction instanceof DamageAction) {
            return this.mergeDamageIntoAction(previousAction, currentAction);
        }
        this.logger.error('incorrect combination of actions to merge damage', previousAction, currentAction)
    }

    private mergeDamages(previousAction: DamageAction, currentAction: DamageAction): DamageAction {
        const damages = ([...(previousAction.damages || []), ...(currentAction.damages || [])]);
        return DamageAction.create(
            {
                timestamp: previousAction.timestamp,
                index: currentAction.index,
                entities: currentAction.entities,
                damages: damages
            },
            this.allCards)
    }

    private mergeDamageIntoAction(previousAction: AttackAction, currentAction: DamageAction): AttackAction {
        return AttackAction.create(
            {
                timestamp: previousAction.timestamp,
                index: currentAction.index,
                entities: currentAction.entities,
                origin: previousAction.origin,
                target: previousAction.target,
                damages: [...(previousAction.damages || []), ...currentAction.damages],
            },
            this.allCards)
    }
}