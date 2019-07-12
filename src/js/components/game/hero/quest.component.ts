import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Entity } from '../../../models/game/entity';
import { GameTag } from '../../../models/enums/game-tags';
import { NGXLogger } from 'ngx-logger';
import { CardClass } from '../../../models/enums/card-class';
import { AllCardsService } from '../../../services/all-cards.service';

@Component({
	selector: 'quest',
	styleUrls: [
        '../../../../css/components/game/hero/quest.component.scss'
    ],
	template: `
        <div class="quest" 
                cardTooltip [tooltipEntity]="_entity"
                [attr.data-entity-id]="entityId">
            <img class="quest-image" src="https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/secrets/quest_button.png">
            <img class="question-mark" src="https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/secrets/quest_bang.png">
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestComponent {

    _entity: Entity;
    entityId: number;
    image: string;
    questionMark: string;
    
    constructor(private logger: NGXLogger, private cards: AllCardsService) {}

    @Input('entity') set entity(value: Entity) {
        this.logger.debug('[quest] setting new entity', value, value.tags.toJS());
        this._entity = value;
        this.image = undefined;
        if (!value) {
            return;
        }
        this.entityId = value.id;
    }
}
