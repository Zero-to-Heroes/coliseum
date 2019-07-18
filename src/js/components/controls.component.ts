import { Component, ChangeDetectionStrategy, HostListener, Output, EventEmitter, ViewEncapsulation, Input } from '@angular/core';
import { Key } from 'ts-keycode-enum';

@Component({
	selector: 'controls',
	styleUrls: [
		'../../css/components/controls.component.scss',
	],
	template: `
        <div class="player-controls light-theme">
			<div class="player-controls-buttons-wrapper">
				<div
						class="player-controls-content player-controls-content-left"
						[style.opacity]="reviewId ? 1 : 0">
					<span class="gs-icon">
						<svg>
							<use xlink:href="assets/svg/share-icons.svg#share-uploaded" />
						</svg>
					</span>
					<p class="player-controls-content-note">
						<a target="_blank" href="https://www.zerotoheroes.com/r/hearthstone/{{reviewId}}">View online</a>
						| <a target="_blank" href="http://replays.firestoneapp.com/?reviewId={{reviewId}}">Discuss</a>
					</p>
				</div>

				<div class="player-controls-content player-controls-content-middle">
					<button class="gs-icon player-control-main hint-tooltip-container" (click)="goPreviousTurn()">
						<svg viewBox="0 0 30 30">
							<polygon points="22 8 12 15 22 22 22 8" fill="currentcolor"/>
							<polygon points="15 8 5 15 15 22 15 8" fill="currentcolor"/>
						</svg>
						<div class="hint-tooltip hint-tooltip-top dark-theme">
							<span>Previous turn<br><kbd>Ctrl</kbd> + <kbd>🡨</kbd></span>
						</div>
					</button>
					<button class="gs-icon player-control-main hint-tooltip-container" (click)="goPreviousAction()">
						<svg viewBox="0 0 30 30">
							<polygon points="20 8 10 15 20 22 20 8" fill="currentcolor"/>
							<rect x="9" y="8" width="1" height="14" fill="currentcolor"/>
						</svg>
						<div class="hint-tooltip hint-tooltip-top dark-theme">
							<span>Previous action<br><kbd>🡨</kbd></span>
						</div>
					</button>
					<button class="gs-icon toggle-icons player-control-main player-control-play hint-tooltip-container">
						<svg viewBox="0 0 40 40">
							<polygon points="13,9 31,20 13,31" fill="currentcolor"/>
						</svg>
						<!--<svg viewBox="0 0 40 40">
							<rect x="13" y="10" width="5" height="20" fill="currentcolor"/>/>
							<rect x="22" y="10" width="5" height="20" fill="currentcolor"/>/>
						</svg>-->
						<div class="hint-tooltip hint-tooltip-top dark-theme">
							<span>Play/Pause<br><kbd>Spacebar</kbd></span>
						</div>
					</button>
					<button class="gs-icon player-control-main hint-tooltip-container" (click)="goNextAction()">
						<svg viewBox="0 0 30 30">
							<polygon points="10 8 20 15 10 22 10 8" fill="currentcolor"/>
							<rect x="20" y="8" width="1" height="14" fill="currentcolor"/>
						</svg>
						<div class="hint-tooltip hint-tooltip-top dark-theme">
							<span>Next action<br><kbd>🡪</kbd></span>
						</div>
					</button>
					<button class="gs-icon player-control-main hint-tooltip-container" (click)="goNextTurn()">
						<svg viewBox="0 0 30 30">
							<polygon points="8,8 18,15 8,22" fill="currentcolor"/>
							<polygon points="15,8 25,15 15,22" fill="currentcolor"/>
						</svg>
						<div class="hint-tooltip hint-tooltip-top dark-theme">
							<span>Next turn<br><kbd>Ctrl</kbd> + <kbd>🡪</kbd></span>
						</div>
					</button>
				</div>

				<div class="player-controls-content player-controls-content-right">
					<div class="player-control-group hint-tooltip-container">
						<button class="gs-icon btn-gs-icon player-control toggled">
							<span class="player-control-text">1<sub>x</sub></span>
						</button>
						<button class="gs-icon btn-gs-icon player-control">
							<span class="player-control-text">2<sub>x</sub></span>
						</button>
						<button class="gs-icon btn-gs-icon player-control">
							<span class="player-control-text">4<sub>x</sub></span>
						</button>
						<button class="gs-icon btn-gs-icon player-control">
							<span class="player-control-text">8<sub>x</sub></span>
						</button>
						<div class="hint-tooltip hint-tooltip-top dark-theme">
							<span>Playback speed<br><kbd>Ctrl</kbd> + <kbd>&#129129; / &#129131;</kbd></span>
						</div>
					</div>
					<div class="gs-icon-divider"></div>
					<button class="gs-icon btn-gs-icon player-control toggle-icons hint-tooltip-container">
						<svg>
							<use xlink:href="/Files/assets/svg/player-controls.svg#player-controls-hide-hidden" />
						</svg>
						<svg>
							<use xlink:href="/Files/assets/svg/player-controls.svg#player-controls-show-hidden" />
						</svg>
						<div class="hint-tooltip hint-tooltip-top hint-tooltip-aligned-right dark-theme">
							<span>Show hidden cards<br><kbd>Ctrl</kbd> + <kbd>H</kbd></span>
						</div>
					</button>
				</div>
			</div>
        </div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ControlsComponent {

	@Input() reviewId;
	@Output() nextAction = new EventEmitter<void>();
	@Output() nextTurn = new EventEmitter<void>();
	@Output() previousAction = new EventEmitter<void>();
	@Output() previousTurn = new EventEmitter<void>();

	constructor() { }

	@HostListener('document:keyup', ['$event'])
	onKeyPressHandler(event: KeyboardEvent) {
		switch (event.which) {
			case Key.RightArrow:
				event.ctrlKey ? this.goNextTurn() : this.goNextAction();
				break;
			case Key.LeftArrow:
				event.ctrlKey ? this.goPreviousTurn() : this.goPreviousAction();
				break;
			case Key.UpArrow:
				break;
			case Key.DownArrow:
				break;
		}
	}

	goPreviousTurn() {
		this.previousTurn.next();
	}

	goPreviousAction() {
		this.previousAction.next();
	}

	goNextAction() {
		this.nextAction.next();
	}

	goNextTurn() {
		this.nextTurn.next();
	}
}
