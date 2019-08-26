import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { NGXLogger } from 'ngx-logger';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/internal/operators';

@Component({
	selector: 'seeker',
	styleUrls: ['../../css/components/seeker.component.scss'],
	template: `
		<div class="player-seeker-container light-theme">
			<input
				#seeker
				type="range"
				min="0"
				max="100"
				step="0.1"
				class="player-seeker"
				[(ngModel)]="progress"
				(ngModelChange)="onInput($event)"
			/>
			<span class="player-seeker-track" [style.background]="background">
				<span class="player-seeker-thumb" [style.left.%]="progress"></span>
			</span>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeekerComponent implements OnDestroy {
	@Output() seek = new EventEmitter<number>();

	progress: number;
	background: SafeStyle;

	private _totalTime = 0;
	private _currentTime = 0;
	private progressChanged: Subject<number> = new Subject<number>();
	private progressSubscription: Subscription;

	constructor(private logger: NGXLogger, private sanitizer: DomSanitizer) {
		// Update the seeker in real time
		this.progressSubscription = this.progressChanged.pipe(distinctUntilChanged()).subscribe(newProgress => {
			this.progress = newProgress;
			this.updateBackground();
		});
		// Periodically send events to the parent, as it involves some computation each time
		this.progressSubscription = this.progressChanged
			.pipe(
				distinctUntilChanged(),
				debounceTime(100),
			)
			.subscribe(newProgress => {
				this.logger.info('[seeker] emitting progress', newProgress * 0.01 * this._totalTime, this._totalTime, newProgress);
				this.seek.next(newProgress * 0.01 * this._totalTime);
			});
	}

	@Input('totalTime') set totalTime(value: number) {
		this.logger.info('[seeker] setting totalTime', value);
		this._totalTime = value;
		this.updateProgress();
	}

	@Input('currentTime') set currentTime(value: number) {
		this.logger.info('[seeker] setting currentTime', value);
		this._currentTime = value;
		this.updateProgress();
	}

	onInput(newProgress: number) {
		this.logger.info('[seeker] clicked on', newProgress);
		this.progressChanged.next(newProgress);
	}

	ngOnDestroy() {
		this.progressSubscription.unsubscribe();
	}

	private updateProgress() {
		if (!this._totalTime) {
			this.progress = undefined;
		}
		this.progress = this._totalTime ? 100 * (this._currentTime / this._totalTime) : undefined;
		this.logger.info('[seeker] progress', this.progress, this._totalTime, this._currentTime);
		this.updateBackground();
	}

	private updateBackground() {
		const backgroundProperty = `linear-gradient(to right, currentcolor ${this.progress}%, var(--background-third) 0)`;
		this.background = this.sanitizer.bypassSecurityTrustStyle(backgroundProperty);
	}
}
