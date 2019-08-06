import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
	selector: 'seeker',
	styleUrls: ['../../css/components/seeker.component.scss'],
	template: `
		<div class="player-seeker-container light-theme">
			<input #seeker type="range" min="0" max="100" step="0.1" value="0" class="player-seeker" (input)="onInput(seeker.value)" />
			<span class="player-seeker-track" [style.background]="background">
				<span class="player-seeker-thumb" [style.left.%]="progress"></span>
			</span>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeekerComponent {
	@Output() seek = new EventEmitter<number>();

	progress: number;
	background: SafeStyle;

	private _totalTime = 0;
	private _currentTime = 0;

	constructor(private logger: NGXLogger, private sanitizer: DomSanitizer) {}

	@Input('totalTime') set totalTime(value: number) {
		this.logger.debug('[seeker] setting totalTime', value);
		this._totalTime = value;
		this.updateProgress();
	}

	@Input('currentTime') set currentTime(value: number) {
		this.logger.debug('[seeker] setting currentTime', value);
		this._currentTime = value;
		this.updateProgress();
	}

	onInput(newProgress: number) {
		this.seek.next(newProgress * 0.01 * this._totalTime);
	}

	private updateProgress() {
		if (!this._totalTime) {
			this.progress = undefined;
		}
		this.progress = this._totalTime ? 100 * (this._currentTime / this._totalTime) : undefined;
		const backgroundProperty = `linear-gradient(to right, currentcolor ${this.progress}%, var(--background-third) 0)`;
		this.background = this.sanitizer.bypassSecurityTrustStyle(backgroundProperty);
	}
}
