import { Injectable } from '@angular/core';

import { default as allCards } from './cards.json';

@Injectable()
export class AllCardsService {

	public getCard(id: string): any {
		return allCards.filter((card) => card.id == id)[0];
	}
}
