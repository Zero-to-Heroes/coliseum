import { Action } from "./action";
import { Map } from "immutable";
import { Entity } from "../game/entity";
import { ActionHelper } from "../../services/parser/action/action-helper";
import { uniq } from 'lodash';


export class CardDrawAction extends Action {
    readonly data: ReadonlyArray<number>;

    public static create(newAction): CardDrawAction {
        return Object.assign(new CardDrawAction(), newAction);
    }

    public update(entities: Map<number, Entity>): CardDrawAction {
        return Object.assign(new CardDrawAction(), this, { entities: entities });
    }

    public enrichWithText(): CardDrawAction {
        const ownerNames: string[] = uniq(this.data
                .map((entityId) => ActionHelper.getOwner(this.entities, entityId))
                .map((playerEntity) => playerEntity.name));
        if (ownerNames.length !== 1) {
            throw new Error('Invalid grouping of cards ' + ownerNames + ', ' + this.data);
        }
        const ownerName = ownerNames[0];
        const textRaw = `\t${ownerName} draws ` + this.data;
        return Object.assign(new CardDrawAction(), this, { textRaw: textRaw });                
    }
}