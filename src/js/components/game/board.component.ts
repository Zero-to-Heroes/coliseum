import { Component, ChangeDetectionStrategy, NgZone, Input } from '@angular/core';

@Component({
	selector: 'board',
	styleUrls: [
        '../../../css/components/game/board.component.scss'
    ],
	template: `
        <div class="board">
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardComponent {
}
