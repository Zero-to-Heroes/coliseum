import { Component, ChangeDetectionStrategy, HostListener, Output, EventEmitter } from '@angular/core';
import { Key } from 'ts-keycode-enum';

@Component({
	selector: 'controls',
	styleUrls: [
		'../../css/components/controls.component.scss'
	],
	template: `
        <div class="controls">

        </div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlsComponent {

	@Output() nextAction = new EventEmitter<void>();
	@Output() nextTurn = new EventEmitter<void>();
	@Output() previousAction = new EventEmitter<void>();
	@Output() previousTurn = new EventEmitter<void>();

	@HostListener('document:keyup', ['$event'])
	onKeyPressHandler(event: KeyboardEvent) {
		switch (event.which) {
			case Key.RightArrow:
				this.nextAction.next();
				break;
			case Key.LeftArrow:
				this.previousAction.next();
				break;
			case Key.UpArrow:
				this.nextTurn.next();
				break;
			case Key.DownArrow:
				this.previousTurn.next();
				break;
		}
	}
}
