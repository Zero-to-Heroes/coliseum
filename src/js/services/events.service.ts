import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';

interface BroadcastEvent {
	key: any;
	data: any[];
}

// https://blog.lacolaco.net/post/event-broadcasting-in-angular-2/
export class Events {
	public static readonly SHOW_TOOLTIP = 'show-tooltip';
	public static readonly HIDE_TOOLTIP = 'hide-tooltip';

	private _eventBus: Subject<BroadcastEvent>;

	constructor() {
		this._eventBus = new Subject<BroadcastEvent>();
	}

	broadcast(key: any, ...data: any[]) {
		this._eventBus.next({key, data});
	}

	on(key: any): Observable<BroadcastEvent> {
		return this._eventBus.asObservable()
			.filter(event => event.key === key)
			.map(event => event);
	}
}
