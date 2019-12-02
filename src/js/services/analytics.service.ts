import { Injectable } from '@angular/core';

var ga;
var amplitude;

@Injectable()
export class AnalyticsService {
	event(event: string, subEvent?: string, value?: string) {
		if (ga) {
			ga('send', 'event', event, subEvent, value);
		}
		if (amplitude) {
			amplitude.getInstance().logEvent('coliseum', {
				'event': event,
				'sub-event': subEvent,
				'value': value,
			});
		}
	}
}
