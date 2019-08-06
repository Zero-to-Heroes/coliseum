import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Entity } from '../../../models/game/entity';
import { NGXLogger } from 'ngx-logger';
import { AllCardsService } from '../../../services/all-cards.service';

@Component({
	selector: 'quest-completed',
	styleUrls: ['../../../../css/components/game/overlay/quest-completed.component.scss'],
	template: `
		<div class="quest-completed">
			<card [entity]="_quest" [hasTooltip]="false"></card>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestCompletedComponent {
	_quest: Entity;

	constructor(private logger: NGXLogger, private cards: AllCardsService) {}

	@Input('quest') set quest(value: Entity) {
		this.logger.debug('[quest-completed] setting quest', value);
		this._quest = value;
	}
}
