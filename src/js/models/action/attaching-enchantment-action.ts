import { Action } from "./action";
import { Map } from "immutable";
import { Entity } from "../game/entity";
import { AllCardsService } from "../../services/all-cards.service";

export class AttachingEnchantmentAction extends Action {
    readonly creatorId: number;
    readonly enchantmentId: number;
    readonly targetId: number;

    readonly allCards: AllCardsService;

    constructor(allCards: AllCardsService) {
        super();
        this.allCards = allCards;
    }

    public static create(newAction, allCards: AllCardsService): AttachingEnchantmentAction {
        return Object.assign(new AttachingEnchantmentAction(allCards), newAction);
    }

    public update(entities: Map<number, Entity>): AttachingEnchantmentAction {
        return Object.assign(new AttachingEnchantmentAction(this.allCards), this, { entities: entities });
    }

    public enrichWithText(): AttachingEnchantmentAction {
        const creatorCardId = this.entities.get(this.creatorId).cardID;
        const creatorCard = this.allCards.getCard(creatorCardId);
        const enchantmentCardId = this.entities.get(this.enchantmentId).cardID;
        const enchantmentCard = this.allCards.getCard(enchantmentCardId);
        const targetCardId = this.entities.get(this.targetId).cardID;
        const targetCard = this.allCards.getCard(targetCardId);
        const textRaw = `\t${creatorCard.name} enchants ${targetCard.name} with ${enchantmentCard.name}`;
        return Object.assign(new AttachingEnchantmentAction(this.allCards), this, { textRaw: textRaw });                
    }
}