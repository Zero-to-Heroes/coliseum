import { Injectable } from '@angular/core';

import allCards from './cards.json';

@Injectable()
export class AllCardsService {

	public getCard(id: string): any {
		const candidates = allCards.filter((card) => card.id === id);
		if (!candidates || candidates.length === 0) {
			console.info('Could not find card for id', id);
			return {};
		}
		return candidates[0];
	}
}
