import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

const CARDS_CDN_URL = 'https://static.zerotoheroes.com/hearthstone/jsoncards/cards.json';

@Injectable()
export class AllCardsService {
	private allCards: any[];

	constructor(private http: HttpClient, private logger: NGXLogger) {
		// We don't call it in the constructor because we want the app to be in control
		// of how they load the cards, and for it to be aware of when cards have been loaded
		// this.retrieveAllCards();
	}

	// We keep this synchronous because we ensure, in the game init pipeline, that loading cards
	// is the first thing we do
	public getCard(id: string): any {
		const candidates = this.allCards.filter(card => card.id === id);
		if (!candidates || candidates.length === 0) {
			this.logger.debug('Could not find card for id', id);
			return {};
		}
		return candidates[0];
	}
	public getCards(): any[] {
		return this.allCards;
	}

	public async initializeCardsDb(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			if (this.allCards) {
				this.logger.debug('[all-cards] already loaded all cards', this.allCards);
				resolve();
				return;
			}
			this.http.get('./cards.json').subscribe(
				(result: any[]) => {
					this.logger.debug('[all-cards] retrieved all cards locally', result.length);
					this.allCards = result;
					resolve();
				},
				error => {
					this.logger.debug('[all-cards] Could not retrieve cards locally, getting them from CDN', error);
					this.http.get(CARDS_CDN_URL).subscribe(
						(result: any[]) => {
							this.logger.debug('[all-cards] retrieved all cards from CDN', result.length);
							this.allCards = result;
							resolve();
						},
						error => {
							this.logger.debug('[all-cards] Could not retrieve cards from CDN', error);
							reject();
						},
					);
				},
			);
		});
	}
}
