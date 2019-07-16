import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'mana-tray',
	styleUrls: [
		'../../../../css/global/text.scss',
		'../../../../css/components/game/manatray/mana-tray.component.scss',
	],
	template: `
        <div class="mana-tray" cardElementResize [fontSizeRatio]="0.06">
            <div class="summary"resizeTarget>
                <span class="available">{{_available}}</span>
                <span class="separator">/</span>
                <span class="total">{{_total}}</span>
            </div>
            <div class="crystals">
                <ul class="present">
                    <li class="mana" *ngFor="let mana of availableArray"></li>
                    <li class="mana spent" *ngFor="let mana of emptyArray"></li>
                    <li class="mana locked" *ngFor="let mana of lockedArray"></li>
                </ul>
            </div>
        </div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManaTrayComponent {

	_total: number;
	_available: number;
	_empty: number;
	_locked: number;
	_futureLocked: number;

	availableArray: number[];
	emptyArray: number[];
	lockedArray: number[];

	constructor(private logger: NGXLogger) {}

	@Input('total') set total(total: number) {
		this.logger.debug('[mana-tray] setting total crystals', total);
		this._total = total;
	}

	@Input('available') set available(available: number) {
		this.logger.debug('[mana-tray] setting available crystals', available);
		this._available = available;
		this.availableArray = Array(available).fill(0);
	}

	@Input('empty') set empty(empty: number) {
		this.logger.debug('[mana-tray] setting empty crystals', empty);
		this._empty = empty;
		this.emptyArray = Array(empty).fill(0);
	}

	@Input('locked') set locked(locked: number) {
		this.logger.debug('[mana-tray] setting locked crystals', locked);
		this._locked = locked;
		this.lockedArray = Array(locked).fill(0);
	}

	@Input('futureLocked') set futureLocked(futureLocked: number) {
		this.logger.debug('[mana-tray] setting futureLocked crystals', futureLocked);
		this._futureLocked = futureLocked;
	}
}
