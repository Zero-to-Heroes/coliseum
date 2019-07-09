import { Component, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { HttpClient, HttpHeaderResponse, HttpHeaders } from '@angular/common/http';

declare var $;

const REVIEW_API = 'https://www.zerotoheroes.com/api/reviews/';
const REPLAY_API = 'https://s3-us-west-2.amazonaws.com/com.zerotoheroes.output/';

@Component({
	selector: 'replay-loader',
    template: ``,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReplayLoaderComponent implements AfterViewInit {

	constructor(private http: HttpClient) {
    }

    async ngAfterViewInit() {
        console.log('window location', window.location);
        const reviewId = this.getSearchParam('reviewId');
        console.log('reviewId', reviewId);
        if (!reviewId) {
            console.warn('loading default replay for demo purposes');
            $.ajax({
                url: 'replay.xml',
                dataType: 'xml',
                success: function(response) {
                    const replayAsString = new XMLSerializer().serializeToString(response);
                    console.log('loaded replay xml', response, window['coliseum']);
                    window['coliseum'].zone.run(() => {
                        console.log('init replay loading');
                        window['coliseum'].component.loadReplay(replayAsString);
                    });
                }
            });
            return;
        }

        const review: any = await this.http.get(REVIEW_API + reviewId).toPromise();
        console.log('loaded review', review);

        const headers = new HttpHeaders({ 'Content-Type': 'text/xml' }).set('Accept', 'text/xml');
        const replay = await this.http.get(REPLAY_API + review.key, { headers: headers, responseType: 'text' }).toPromise();
        console.log('loaded replay', replay);
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
                .map(param => param.split('=')[1])
                [0];
    }
}
