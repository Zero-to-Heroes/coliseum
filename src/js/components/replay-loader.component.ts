import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, ChangeDetectionStrategy, Component } from '@angular/core';

declare var $;

const REPLAY_API = 'https://s3-us-west-2.amazonaws.com/com.zerotoheroes.output/';

@Component({
	selector: 'replay-loader',
	template: ``,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReplayLoaderComponent implements AfterViewInit {
	constructor(private http: HttpClient) {}

	async ngAfterViewInit() {
		const reviewId = this.getSearchParam('reviewId');
		// console.log('reviewId', reviewId);
		if (!reviewId) {
			console.warn('loading default replay for demo purposes');
			$.ajax({
				url: 'replay.xml',
				dataType: 'xml',
				success: function(response) {
					const replayAsString = new XMLSerializer().serializeToString(response);
					// console.log('loaded replay xml', response, window['coliseum']);
					window['coliseum'].zone.run(() => {
						// console.log('init replay loading');
						window['coliseum'].component.loadReplay(replayAsString);
					});
				},
			});
			return;
		}

		window['coliseum'].zone.run(() => {
			window['coliseum'].component.updateStatus('Downloading replay file');
		});
		console.log('sending request with creds');
		const review: any = await this.http
			.get(`https://nj8w9uc6p5.execute-api.us-west-2.amazonaws.com/Prod/${reviewId}`, {
				headers: new HttpHeaders({
					'Content-Type': 'application/json',
				}).set('Accept', 'application/json'),
				withCredentials: false,
			})
			.toPromise();
		console.log('review in coliseum', review);
		const headers = new HttpHeaders({ 'Content-Type': 'text/xml' }).set('Accept', 'text/xml');
		const replay = await this.http
			.get(REPLAY_API + review.replayKey, { headers: headers, responseType: 'text' })
			.toPromise();
		window['coliseum'].zone.run(() => {
			window['coliseum'].component.loadReplay(replay);
		});
	}

	private getSearchParam(name: string): string {
		const searchString = window.location.search.substring(1);
		const searchParams = searchString.split('&');
		return searchParams
			.filter(param => param.indexOf('=') !== -1)
			.filter(param => param.split('=')[0] === name)
			.map(param => param.split('=')[1])[0];
	}
}
