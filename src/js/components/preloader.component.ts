import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NGXLogger } from 'ngx-logger';
import { preloader } from '../../assets/svg/preloader';
import { AllCardsService } from '../services/all-cards.service';

@Component({
	selector: 'preloader',
	styleUrls: ['../../css/components/preloader.component.scss'],
	template: `
		<div class="preloader" [innerHTML]="svg"></div>
		<figure class="preloader-quote">
			<blockquote class="preloader-quote-text">"{{ quote }}"</blockquote>
			<figcaption class="preloader-quote-author">
				<strong>{{ cardName }}</strong>
			</figcaption>
		</figure>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreloaderComponent implements OnInit, OnDestroy {
	svg: SafeHtml;
	quote: string;
	cardName: string;

	private cardsWithQuotes: any[];
	private interval;

	constructor(
		private logger: NGXLogger,
		private domSanitizer: DomSanitizer,
		private cards: AllCardsService,
		private cdr: ChangeDetectorRef,
	) {
		this.svg = this.domSanitizer.bypassSecurityTrustHtml(preloader);
	}

	async ngOnInit() {
		await this.cards.initializeCardsDb();
		this.cardsWithQuotes = this.cards.getCards().filter(card => card.flavor);
		this.chooseRandomQuote();
		this.interval = setInterval(() => this.chooseRandomQuote(), 7000);
	}

	private chooseRandomQuote() {
		try {
			const card = this.cardsWithQuotes[Math.floor(Math.random() * this.cardsWithQuotes.length)];
			this.quote = card.flavor;
			this.cardName = card.name;
			this.cdr.detectChanges();
		} catch (e) {
			this.logger.error('[preloader] could not load quote', e);
		}
	}

	ngOnDestroy() {
		clearInterval(this.interval);
	}
}
