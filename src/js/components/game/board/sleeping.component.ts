import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'sleeping',
	styleUrls: ['../../../../css/global/text.scss', '../../../../css/components/game/board/sleeping.component.scss'],
	template: `
		<div class="sleeping">
			<img
				class="sleeping-icon"
				src="https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/exhausted.png"
			/>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SleepingComponent {}
