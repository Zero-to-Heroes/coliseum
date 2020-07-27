import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, ChangeDetectionStrategy, Component } from '@angular/core';
import { GameSample } from '@firestone-hs/simulate-bgs-battle/dist/simulation/spectator/game-sample';
import { loadAsync } from 'jszip';

declare let $;

const REPLAY_API = 'https://xml.firestoneapp.com/';
const BGS_SAMPLE_API = 'https://static-api.firestoneapp.com/retrieveBgsSimulationSample/';

@Component({
	selector: 'replay-loader',
	template: ``,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReplayLoaderComponent implements AfterViewInit {
	constructor(private http: HttpClient) {}

	async ngAfterViewInit() {
		const reviewId = this.getSearchParam('reviewId');
		const bgsSimulation = this.getSearchParam('bgsSimulation');
		const bgsSimulationId = this.getSearchParam('bgsSimulationId');
		console.log('params', reviewId, bgsSimulationId, bgsSimulation);
		if (!reviewId && !bgsSimulation && !bgsSimulationId) {
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

		if (reviewId) {
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
		} else if (bgsSimulation) {
			window['coliseum'].zone.run(() => {
				window['coliseum'].component.updateStatus('Decoding battlegrounds simulation result');
			});
			console.log('decoding', bgsSimulation);
			const decoded = atob(bgsSimulation);
			console.log('decoded', decoded);
			const parsed = JSON.parse(decoded);
			console.log('parsed', parsed);
			window['coliseum'].zone.run(() => {
				window['coliseum'].component.parseBgsSimulation(parsed);
			});
		} else if (bgsSimulationId) {
			window['coliseum'].zone.run(() => {
				window['coliseum'].component.updateStatus('Loading battlegrounds simulation result');
			});
			console.log('loading', bgsSimulationId);
			const gameSample = await this.retrieveEncodedSimulation(bgsSimulationId);
			// console.log('decoding', encodedSimulation);
			// const decoded = atob(encodedSimulation);
			// console.log('decoded', decoded);
			// const parsed = JSON.parse(decoded);
			console.log('parsed', gameSample);
			window['coliseum'].zone.run(() => {
				window['coliseum'].component.parseBgsSimulation(gameSample);
			});
		}
	}

	private async retrieveEncodedSimulation(bgsSimulationId: string): Promise<GameSample> {
		try {
			const sample: GameSample = (await this.http
				.get(BGS_SAMPLE_API + bgsSimulationId, {
					headers: new HttpHeaders({
						'Content-Type': 'application/json',
					}).set('Accept', 'application/json'),
					withCredentials: false,
				})
				.toPromise()) as GameSample;
			console.log('retrieved sample', sample);
			return sample;
		} catch (e) {
			console.error('issue retrieve bgs sample', bgsSimulationId, e.message, e);
		}
		return null;
	}

	private async loadReplay(replayKey: string): Promise<string> {
		if (!replayKey) {
			return null;
		}
		if (replayKey.endsWith('.zip')) {
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
