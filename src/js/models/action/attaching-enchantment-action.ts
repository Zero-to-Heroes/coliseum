import { Action } from "./action";
import { Map } from "immutable";
import { Entity } from "../game/entity";
import { AllCardsService } from "../../services/all-cards.service";
import { PlayerEntity } from "../game/player-entity";

export class AttachingEnchantmentAction extends Action {
    readonly creatorId: number;
    readonly enchantmentCardId: string;
    readonly targetIds: ReadonlyArray<number>;

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
        const enchantmentCard = this.allCards.getCard(this.enchantmentCardId);
        const targetCardNames = this.targetIds
                .map((targetId) => this.entities.get(targetId))
                .map((targetEntity) => targetEntity.cardID 
                        ? this.allCards.getCard(targetEntity.cardID ).name
                        // Enchantments sometimes target the player itself, not the hero
                        : (targetEntity as PlayerEntity).name)
                .join(', ');
        const textRaw = `\t${creatorCard.name} enchants ${targetCardNames} with ${enchantmentCard.name}`;
        return Object.assign(new AttachingEnchantmentAction(this.allCards), this, { textRaw: textRaw });                
    }
}