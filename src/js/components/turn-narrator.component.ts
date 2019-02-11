import { Component, ChangeDetectionStrategy, NgZone, ChangeDetectorRef, HostListener, AfterViewInit, ViewRef, Input } from '@angular/core';
import { Map } from 'immutable';
import { Key } from 'ts-keycode-enum';
import { Entity } from '../models/game/entity';
import { Game } from '../models/game/game';
import { GameParserService } from '../services/parser/game-parser.service';
import { Events } from '../services/events.service';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'turn-narrator',
	styleUrls: [
		'../../css/components/turn-narrator.component.scss'
	],
	template: `
        <div class="turn-narrator">
            <span [innerHTML]="_text"></span>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TurnNarratorComponent {

    _text: string;

    @Input("text") set text(text:string) {
        this._text = text.replace('\n', '<br/>');
    };
}
