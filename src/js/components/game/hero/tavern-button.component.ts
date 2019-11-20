import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { GameTag } from '@firestone-hs/reference-data';
import { Entity } from '@firestone-hs/replay-parser';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'tavern-button',
	styleUrls: ['../../../../css/components/game/hero/tavern-button.component.scss'],
	template: `
		<div
			*ngIf="_entity"
			class="tavern-button"
			[ngClass]="{ 'highlight': _option }"
			[attr.data-entity-id]="entityId"
		>
			<img class="art" [src]="actionSrc" />
			<img
				class="frame"
				src="https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/battlegrounds/tavern-button-frame.png"
			/>
			<coin-cost [cardId]="cardId" [cost]="cost"></coin-cost>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TavernButtonComponent {
	_entity: Entity;
	entityId: number;
	cardId: string;
	cost: number;
	exhausted: boolean;
	_option: boolean;
	actionSrc: string;

	constructor(private logger: NGXLogger) {}

	@Input() set entity(value: Entity) {
		this._entity = value;
		this.entityId = value ? value.id : undefined;
		this.cardId = value ? value.cardID : undefined;
		this.actionSrc = `https://static.zerotoheroes.com/hearthstone/cardart/256x/${this.cardId}.jpg`;
		this.cost = value ? value.getTag(GameTag.COST) : undefined;
	}

	@Input('option') set option(value: boolean) {
		this._option = value;
		// console.log('setting option', this._entity && this._entity.id, value);
	}
}
