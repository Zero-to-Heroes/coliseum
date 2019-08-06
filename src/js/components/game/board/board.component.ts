import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Entity } from '../../../models/game/entity';
import { NGXLogger } from 'ngx-logger';
import { GameTag } from '../../../models/enums/game-tags';

@Component({
	selector: 'board',
	styleUrls: ['../../../../css/components/game/board/board.component.scss'],
	template: `
		<ul class="board">
			<li *ngFor="let entity of _entities; trackBy: trackByFn">
				<card-on-board [entity]="entity" [enchantments]="buildEnchantments(entity)" [option]="isOption(entity)"> </card-on-board>
			</li>
		</ul>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardComponent {
	_entities: readonly Entity[];
	_enchantmentCandidates: readonly Entity[];
	_options: readonly number[];

	constructor(private logger: NGXLogger) {}

	@Input('entities') set entities(entities: readonly Entity[]) {
		this.logger.debug('[board] setting new entities', entities);
		this._entities = entities;
	}

	@Input('enchantmentCandidates') set enchantmentCandidates(value: readonly Entity[]) {
		this.logger.debug('[board] setting enchantmentCandidates', value);
		this._enchantmentCandidates = value;
	}

	@Input('options') set options(value: readonly number[]) {
		this.logger.debug('[board] setting options', value);
		this._options = value;
	}

	isOption(entity: Entity): boolean {
		return this._options.indexOf(entity.id) !== -1;
	}

	trackByFn(index, item: Entity) {
		return item.id;
	}

	buildEnchantments(entity: Entity): readonly Entity[] {
		if (!this._enchantmentCandidates) {
			return [];
		}
		return this._enchantmentCandidates.filter(e => e.getTag(GameTag.ATTACHED) === entity.id);
	}
}
