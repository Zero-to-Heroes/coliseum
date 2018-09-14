import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'app-root',
	styleUrls: [],
	template: `
		<div>Hola
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {

	constructor() {
	}
}
