import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { GameTag } from '../../../models/enums/game-tags';
import { Entity } from '../../../models/game/entity';

@Component({
	selector: 'hero-overlays',
	styleUrls: ['../../../../css/global/text.scss', '../../../../css/components/game/hero/hero-overlays.component.scss'],
	template: `
		<div class="hero-overlays" *ngIf="overlays.length > 0">
			<img *ngFor="let overlay of overlays" class="overlay {{ overlay[0] }}" src="{{ overlay[1] }}" />
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroOverlaysComponent {
	overlays: string[][];

	constructor(private logger: NGXLogger) {}

	@Input('entity') set entity(value: Entity) {
		this.logger.debug('[hero-overlays] setting entity', value);
		this.overlays = [];
		if (!value) {
			return;
		}
		if (value.getTag(GameTag.CANT_BE_DAMAGED) === 1) {
			this.pushOverlay('hero_immune');
		}
		if (value.getTag(GameTag.HEAVILY_ARMORED) === 1) {
			this.pushOverlay('hero_heavily_armored');
		}
		if (value.getTag(GameTag.FROZEN) === 1) {
			this.pushOverlay('hero_frozen');
		}
		if (value.getTag(GameTag.STEALTH) === 1) {
			this.pushOverlay('hero_stealth');
		}
	}

	private pushOverlay(image: string) {
		this.overlays.push([image, `https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/overlays/${image}.png`]);
	}
}
