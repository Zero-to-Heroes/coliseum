import { Map } from "immutable";
import { Entity } from "./entity";
import { GameTag } from "./game-tags";
import { Zone } from "./enums/zone";

export class GameHepler {

    private constructor() {}

    public static getPlayerHand(entities: Map<number, Entity>, playerId: number): ReadonlyArray<Entity> {
        return entities
                .filter((entity: Entity) => entity.getTag(GameTag.CONTROLLER) === playerId)
                .filter((entity: Entity) => entity.getTag(GameTag.ZONE) === Zone.HAND)
                .sortBy((entity: Entity) => entity.getTag(GameTag.ZONE_POSITION))
                .toArray();
    }
}