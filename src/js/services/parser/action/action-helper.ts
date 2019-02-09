import { PlayerEntity } from "../../../models/game/player-entity";
import { Entity } from "../../../models/game/entity";
import { Map } from "immutable";
import { GameTag } from "../../../models/enums/game-tags";

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
}