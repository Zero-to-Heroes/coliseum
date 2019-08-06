import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Entity } from '../../../models/game/entity';

@Component({
	selector: 'card-enchantments',
	styleUrls: ['../../../../css/global/text.scss', '../../../../css/components/game/card/card-enchantments.component.scss'],
	template: `
		<div class="card-enchantments">
			<card-enchantment *ngFor="let enchantment of _enchantments; trackBy: trackByFn" [enchantment]="enchantment"> </card-enchantment>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardEnchantmentsComponent {
	_enchantments: readonly Entity[];

	constructor(private logger: NGXLogger) {}

	@Input('enchantments') set enchantments(value: readonly Entity[]) {
		this.logger.debug('[card-enchantments] setting enchantments', value);
		this._enchantments = value;
	}

	trackByFn(index, item: Entity) {
		return item.id;
	}
}
