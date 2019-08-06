import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'fatigue',
	styleUrls: ['../../../../css/components/game/overlay/fatigue.component.scss'],
	template: `
		<div class="fatigue" cardElementResize [fontSizeRatio]="0.05">
			<img src="https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/fatigue.png" />
			<div class="text" resizeTarget>
				<span>Out of cards! Take {{ _fatigue }} damage.</span>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FatigueComponent {
	_fatigue: number;

	constructor(private logger: NGXLogger) {}

	@Input('fatigue') set fatigue(value: number) {
		this.logger.debug('[fatigue] setting fatigue', value);
		this._fatigue = value;
	}
}
