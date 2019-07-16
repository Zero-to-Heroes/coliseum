import { Action } from './action';
import { Map } from 'immutable';
import { Entity } from '../game/entity';
import { AllCardsService } from '../../services/all-cards.service';
import { ActionHelper } from '../../services/parser/action/action-helper';
export class DiscoveryPickAction extends Action {
	readonly owner: number;
	readonly choice: number;

	constructor(private allCards: AllCardsService) {
		super();
	}

	public static create(newAction, allCards: AllCardsService): DiscoveryPickAction {
		return Object.assign(new DiscoveryPickAction(allCards), newAction);
	}

	public update(entities: Map<number, Entity>): DiscoveryPickAction {
		return Object.assign(new DiscoveryPickAction(this.allCards), this, { entities: entities });
	}

	public enrichWithText(): DiscoveryPickAction {
		const ownerEntity = ActionHelper.getOwner(this.entities, this.owner);
		const choiceCardId = ActionHelper.getCardId(this.entities, this.choice);
		let chosenCardText = 'one card';
		if (choiceCardId) {
			chosenCardText = this.allCards.getCard(choiceCardId).name;
		}
		const textRaw = `\t${ownerEntity.name} picks ${chosenCardText}`;
		return Object.assign(new DiscoveryPickAction(this.allCards), this, { textRaw: textRaw });
	}

	protected getInstance(): Action {
		return new DiscoveryPickAction(this.allCards);
	}
}
