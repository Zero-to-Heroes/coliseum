import { ChangeDetectionStrategy, Component, HostListener, Input } from '@angular/core';
import { Entity } from '@firestone-hs/replay-parser';
import { NGXLogger } from 'ngx-logger';
import { Events } from '../../../services/events.service';

@Component({
	selector: 'quest',
	styleUrls: ['../../../../css/components/game/hero/quest.component.scss'],
	template: `
		<div class="quest" [attr.data-entity-id]="entityId">
			<img
				class="quest-image"
				src="https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/secrets/quest_button.png"
			/>
			<img
				class="question-mark"
				src="https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/secrets/quest_bang.png"
			/>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestComponent {
	_entity: Entity;
	entityId: number;
	image: string;
	questionMark: string;

	constructor(private logger: NGXLogger, private events: Events) {}

	@Input('entity') set entity(value: Entity) {
		this.logger.debug('[quest] setting new entity', value, value.tags.toJS());
		this._entity = value;
		this.image = undefined;
		if (!value) {
			return;
		}
		this.entityId = value.id;
	}

	@HostListener('mouseenter')
	onMouseEnter() {
		this.events.broadcast(Events.SHOW_QUEST_TOOLTIP, this._entity);
	}

	@HostListener('mouseleave')
	onMouseLeave() {
		this.events.broadcast(Events.HIDE_QUEST_TOOLTIP);
	}
}
