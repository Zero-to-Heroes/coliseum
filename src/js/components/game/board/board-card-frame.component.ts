import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { AllCardsService } from '../../../services/all-cards.service';
import { CardClass } from '../../../models/enums/card-class';
import { CardType } from '../../../models/enums/card-type';

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
    private _premium: boolean = undefined;

    constructor(private cards: AllCardsService) { }

    @Input('taunt') set taunt(taunt: boolean) {
        console.log('[board-card-frame] setting taunt', taunt);
        this._taunt = taunt;
        this.updateImage();
    }

    @Input('premium') set premium(premium: boolean) {
        console.log('[board-card-frame] setting premium', premium);
        this._premium = premium;
        this.updateImage();
    }

    private updateImage() {
        if (this._taunt == undefined || this._premium == undefined) {
            return;
        }
        const frame = this.taunt ? 'onboard_minion_taunt.png' : 'onboard_minion_frame.png';
        const premiumFrame = this.premium ? `golden/${frame}` : frame;
        
        this.image = `https://static.zerotoheroes.com/hearthstone/asset/manastorm/${premiumFrame}`;
    }
}
