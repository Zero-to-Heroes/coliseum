import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, ChangeDetectionStrategy, Component } from '@angular/core';
import { loadAsync } from 'jszip';

declare let $;

const REPLAY_API = 'https://xml.firestoneapp.com/';

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
		const replay = await this.loadReplay(review.replayKey);
		window['coliseum'].zone.run(() => {
			window['coliseum'].component.loadReplay(replay);
		});
	}

	private async loadReplay(replayKey: string): Promise<string> {
		if (replayKey?.endsWith('.zip')) {
			const headers = new HttpHeaders({ 'Content-Type': 'application/zip' }).set('Accept', 'application/zip');
			const zippedReplay = await this.http
				.get(REPLAY_API + replayKey, { headers: headers, responseType: 'blob' })
				.toPromise();
			const zipContent = await loadAsync(zippedReplay as any);
			const file = Object.keys(zipContent.files)[0];
			// console.log('files in zip', zipContent.files, file);
			const replay = await zipContent.file(file).async('string');
			return replay;
		} else {
			const headers = new HttpHeaders({ 'Content-Type': 'text/xml' }).set('Accept', 'text/xml');
			const replay = await this.http
				.get(REPLAY_API + replayKey, { headers: headers, responseType: 'text' })
				.toPromise();
			return replay;
		}
	}

	private getSearchParam(name: string): string {
		const searchString = window.location.search.substring(1);
		const searchParams = searchString?.split('&') || [];
		return searchParams
			.filter(param => param.indexOf('=') !== -1)
			.filter(param => param.split('=')[0] === name)
			.map(param => param.split('=')[1])[0];
	}
}
