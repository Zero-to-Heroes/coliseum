import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'weapon-frame',
	styleUrls: ['../../../../css/components/game/hero/weapon-frame.component.scss'],
	template: `
		<img src="{{ image }}" class="weapon-frame" />
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeaponFrameComponent {
	image: string;

	constructor(private logger: NGXLogger) {}

	@Input('exhausted') set exhausted(value: boolean) {
		this.logger.debug('[weapon-frame] setting exhausted', value);
		this.image = value
			? `https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/weapon_sheathed.png`
			: `https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/weapon_unsheathed.png`;
	}
}
