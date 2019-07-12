import { PlayerEntity } from "../../../models/game/player-entity";
import { Entity } from "../../../models/game/entity";
import { Map } from "immutable";
import { GameTag } from "../../../models/enums/game-tags";
import { Action } from "../../../models/action/action";
import { isEqual } from "lodash";
import { EntityTag } from "../../../models/parser/entity-tag";
import { Damage } from "../../../models/action/damage";

export class ActionHelper {

    public static getOwner(entities: Map<number, Entity>, entityId: number): PlayerEntity {
        let ownerId = entityId;
        let owner = entities.get(ownerId);
        if (!(owner instanceof PlayerEntity)) {
            const controllerId = entities.get(entityId).getTag(GameTag.CONTROLLER);
            owner = entities
                    .filter((entity: Entity) => entity instanceof PlayerEntity)
                    .filter((entity: PlayerEntity) => entity.playerId === controllerId)
                    .first();
        }
        return owner as PlayerEntity;
    }

    public static getCardId(entities: Map<number, Entity>, entityId: number): string {
        const entity = entities.get(entityId);
        if (entity.cardID) {
            return entity.cardID;
        }
        // Otherwise, this can happen when we're targeting a player entity, which doesn't have a card id
        if (!(entity instanceof PlayerEntity)) {
            console.warn('Could not get card id from a non-player entity', entityId, entity, entity.tags.toJS());
        }
        const heroEntityId = entity.getTag(GameTag.HERO_ENTITY);
        return entities.get(heroEntityId).cardID;
    }

    public static combineActions<T extends Action> (
            actions: ReadonlyArray<Action>, 
            shouldMerge: (a: Action, b: Action) => boolean,
            combiner: (a: T, b: T) => T,
            shouldSwap?: (a: Action, b: Action) => boolean): ReadonlyArray<Action> {
        let previousResult = actions;
        let result: ReadonlyArray<Action> = ActionHelper.doCombine(previousResult, shouldMerge, combiner, shouldSwap);
        while (!isEqual(result, previousResult)) {
            previousResult = result;
            result = ActionHelper.doCombine(previousResult, shouldMerge, combiner);
        }
        return result;
    }

    public static getTag(tags: ReadonlyArray<EntityTag>, name: GameTag): number {
        const defender = tags.find(tag => tag.tag === name);
        return defender ? defender.value : 0;
    }

    public static mergeIntoFirstAction<T extends Action>(first: T, second: Action, newElements: T): T {
        const result = first.updateAction(newElements);
        // const concat = [...(first.damages || []), ...(second.damages || [])] as ReadonlyArray<Damage>;
        const finalDamages = first.damages.mergeWith((prev, next) => prev + next, second.damages);
        return result.updateAction({
            damages: finalDamages,
        } as T) as T;
    }

    private static doCombine<T extends Action>(
            actions: ReadonlyArray<Action>, 
            shouldMerge: (a: Action, b: Action) => boolean,
            combiner: (a: T, b: T) => T,
            shouldSwap?: (a: Action, b: Action) => boolean): ReadonlyArray<Action> {
        const result: Action[] = [];
        let previousAction: Action;
        // console.log('considering actions to merge', actions);
        for (let i = 0; i < actions.length; i++) {
            const currentAction = actions[i];
            if (shouldMerge(previousAction, currentAction)) {
                const index = result.indexOf(previousAction);
                previousAction = combiner(previousAction as T, currentAction as T);
                result[index] = previousAction;
            }
            // This occurs rarely, when some mulligan card chocies are logged before the full mulligan card options
            else if (shouldSwap && shouldSwap(previousAction, currentAction)) {
                const index = result.indexOf(previousAction);
                result[index] = currentAction;
                result[index + 1] = previousAction;
            }
            else {
                previousAction = currentAction;
                result.push(currentAction);
            }
        }
        return result;
    }
}