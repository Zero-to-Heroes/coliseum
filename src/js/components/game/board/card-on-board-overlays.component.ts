import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Entity } from '../../../models/game/entity';
import { GameTag } from '../../../models/enums/game-tags';

@Component({
	selector: 'card-on-board-overlays',
	styleUrls: [
		'../../../../css/global/text.scss',
		'../../../../css/components/game/board/card-on-board-overlays.component.scss',
	],
	template: `
        <div class="card-on-board-overlays" *ngIf="overlays.length > 0">
            <img *ngFor="let overlay of overlays" class="overlay {{overlay[0]}}" src="{{overlay[1]}}" />
        </div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardOnBoardOverlaysComponent {

    overlays: string[][];

    constructor(private logger: NGXLogger) { }

    @Input('entity') set entity(value: Entity) {
        this.logger.debug('[card-on-board-overlays] setting entity', value);
        this.overlays = [];
        if (value.getTag(GameTag.CANT_BE_DAMAGED) === 1) {
            this.pushOverlay('minion_immune');
        }
        if (value.getTag(GameTag.DIVINE_SHIELD) === 1) {
            this.pushOverlay('minion_divine_shield');
        }
        if (value.getTag(GameTag.SILENCED) === 1) {
            this.pushOverlay('minion_silenced'); // missing
        }
        if (value.getTag(GameTag.FROZEN) === 1) {
            this.pushOverlay('minion_frozen');
        }
        if (value.getTag(GameTag.STEALTH) === 1) {
            this.pushOverlay('minion_stealth');
        }
        if (value.getTag(GameTag.CANT_BE_TARGETED_BY_ABILITIES) === 1 
                && value.getTag(GameTag.CANT_BE_TARGETED_BY_HERO_POWERS) === 1) {
            this.pushOverlay('minion_elusive'); // missing
        }
        if (value.getTag(GameTag.WINDFURY) === 1) {
            this.pushOverlay('minion_windfury');
        }
        if (value.getTag(GameTag._333) === 1) {
            this.pushOverlay('minion_temporary_effect');
        }
    }

    private pushOverlay(image: string) {
        this.overlays.push([image, `https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/overlays/${image}.png`])
    }
}