import { Map } from "immutable";
import { Entity } from "./entity";
import { GameTag } from "../enums/game-tags";
import { Zone } from "../enums/zone";
import { Game } from "./game";
import { PlayerEntity } from "./player-entity";

export class GameHepler {

    private constructor() {}

    public static getPlayerHand(entities: Map<number, Entity>, playerId: number): ReadonlyArray<Entity> {
        return entities
                .filter((entity: Entity) => entity.getTag(GameTag.CONTROLLER) === playerId)
                .filter((entity: Entity) => entity.getTag(GameTag.ZONE) === Zone.HAND)
                .sortBy((entity: Entity) => entity.getTag(GameTag.ZONE_POSITION))
                .toArray();
    }
    
    public static isPlayerEntity(entityId: number, game: Game) {
        return game.entities.get(entityId) instanceof PlayerEntity;
    }

    public static isGameEntity(entityId: number, game: Game) {
        return entityId == 1;
    }
}