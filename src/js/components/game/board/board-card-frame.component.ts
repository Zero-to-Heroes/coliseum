import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { AllCardsService } from '../../../services/all-cards.service';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'board-card-frame',
	styleUrls: [
		'../../../../css/components/game/board/board-card-frame.component.scss'
	],
	template: `
        <img src="{{image}}" class="card-frame" />
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardCardFrameComponent {

    image: string;

    private _taunt: boolean;
    private _hideStats: boolean;
    private _premium: boolean = undefined;

    constructor(private cards: AllCardsService, private logger: NGXLogger) { }

    @Input('taunt') set taunt(taunt: boolean) {
        this.logger.debug('[board-card-frame] setting taunt', taunt);
        this._taunt = taunt;
        this.updateImage();
    }

    @Input('premium') set premium(premium: boolean) {
        this.logger.debug('[board-card-frame] setting premium', premium);
        this._premium = premium;
        this.updateImage();
    }

    @Input('hideStats') set hideStats(value: boolean) {
        this.logger.debug('[board-card-frame] setting hideStats', value);
        this._hideStats = value;
        this.updateImage();
    }

    private updateImage() {
        const frame = this._taunt 
                ? 'onboard_minion_taunt' 
                : (this._hideStats 
                        ? 'onboard_minion_hide_stats'
                        : 'onboard_minion_frame');
        const premiumFrame = this._premium ? `${frame}_premium` : frame;
        this.image = `https://static.zerotoheroes.com/hearthstone/asset/coliseum/images/${premiumFrame}.png`;
    }
}
