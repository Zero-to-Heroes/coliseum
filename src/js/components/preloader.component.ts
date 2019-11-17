import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	Input,
	OnDestroy,
	OnInit,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AllCardsService } from '@firestone-hs/replay-parser';
import { NGXLogger } from 'ngx-logger';
import { preloader } from '../../assets/svg/preloader';

@Component({
	selector: 'preloader',
	styleUrls: ['../../css/components/preloader.component.scss'],
	template: `
		<div class="preloader" [innerHTML]="svg"></div>
		<figure class="preloader-quote">
			<blockquote class="preloader-quote-text" [innerHTML]="quote"></blockquote>
			<figcaption class="preloader-quote-author">
				<strong>{{ cardName }}</strong>
			</figcaption>
		</figure>
		<div class="status">{{ _status }}</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreloaderComponent implements OnInit, AfterViewInit, OnDestroy {
	_status: string;
	svg: SafeHtml;
	quote: string;
	cardName: string;

	@Input() set status(value: string) {
		this._status = value;
		console.log('setting status', value);
		if (value === 'error') {
			console.log('setting error status', value);
			this.quote =
				'An error occured while parsing the replay. Please contact the support on <a href="https://twitter.com/ZerotoHeroes_HS" target="_blank">Twitter</a> or <a href="https://discord.gg/4Gpavvt" target="_blank">Discord</a>';
			this.cardName = 'Alarm-o-Bot';
			this.svg = null;
			clearInterval(this.interval);
			this.cdr.detectChanges();
		}
	}

	private cardsWithQuotes: any[];
	private interval;

	constructor(
		private logger: NGXLogger,
		private domSanitizer: DomSanitizer,
		private cards: AllCardsService,
		private cdr: ChangeDetectorRef,
	) {}

	async ngOnInit() {
		await this.cards.initializeCardsDb();
		this.cardsWithQuotes = this.cards.getCards().filter(card => card.flavor);
		this.chooseRandomQuote();
		this.interval = setInterval(() => this.chooseRandomQuote(), 7000);
	}

	ngAfterViewInit() {
		this.svg = this.domSanitizer.bypassSecurityTrustHtml(preloader);
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
