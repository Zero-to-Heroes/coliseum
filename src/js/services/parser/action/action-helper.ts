import { PlayerEntity } from "../../../models/game/player-entity";
import { Entity } from "../../../models/game/entity";
import { Map } from "immutable";
import { GameTag } from "../../../models/enums/game-tags";
import { Action } from "../../../models/action/action";
import { isEqual } from "lodash";

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

    public static combineActions<T extends Action> (
            actions: ReadonlyArray<Action>, 
            shouldMerge: (a: Action, b: Action) => boolean,
            combiner: (a: T, b: T) => T): ReadonlyArray<Action> {
        let previousResult = actions;
        let result: ReadonlyArray<Action> = ActionHelper.doCombine(previousResult, shouldMerge, combiner);
        while (!isEqual(result, previousResult)) {
            previousResult = result;
            result = ActionHelper.doCombine(previousResult, shouldMerge, combiner);
        }
        return result;
    }

    private static doCombine<T extends Action>(
            actions: ReadonlyArray<Action>, 
            shouldMerge: (a: Action, b: Action) => boolean,
            combiner: (a: T, b: T) => T): ReadonlyArray<Action> {
        const result: Action[] = [];
        let previousAction: Action;
        for (let i = 0; i < actions.length; i++) {
            const currentAction = actions[i];
            if (shouldMerge(previousAction, currentAction)) {
                const index = result.indexOf(previousAction);
                previousAction = combiner(previousAction as T, currentAction as T);
                result[index] = previousAction;
            }
            else {
                previousAction = currentAction;
                result.push(currentAction);
            }
        }
        return result;
    }
}