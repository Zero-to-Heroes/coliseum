import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AllCardsService } from '@firestone-hs/replay-parser';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'visual-board-state-change',
	styleUrls: ['../../../../css/components/game/overlay/visual-board-state-change.component.scss'],
	template: `
		<div class="visual-board-state-change" cardElementResize [isCardElement]="false" [fontSizeRatio]="0.04">
			<div class="state recruit" *ngIf="state === 1">
				<img
					class="splash"
					src="https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/battlegrounds/recruit.png"
				/>
				<div class="text"><span resizeTarget>Recruit</span></div>
			</div>
			<div class="state combat" *ngIf="state === 2">
				<img
					class="splash"
					src="https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/battlegrounds/combat.png"
				/>
				<div class="text" resizeTarget><span>Combat</span></div>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisualBoardStateChangeComponent {
	@Input() state: number;

	constructor(private logger: NGXLogger, private cards: AllCardsService) {}
}
