import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
	selector: 'turn-narrator',
	styleUrls: ['../../css/components/turn-narrator.component.scss'],
	template: `
		<div class="turn-narrator">
			<span [innerHTML]="_text"></span>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TurnNarratorComponent {
	_text: string;

	@Input('text') set text(text: string) {
		if (!text) {
			return;
		}
		this._text = text.replace('\n', '<br/>');
	}
}
