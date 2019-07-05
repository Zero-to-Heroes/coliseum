import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Entity } from '../../../models/game/entity';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'secrets',
	styleUrls: [
        '../../../../css/components/game/hero/secrets.component.scss'
    ],
	template: `
        <div class="secrets">
            <secret *ngFor="let entity of _secrets; let i = index; trackBy: trackByFn" 
                    [entity]="entity"
                    [style.left.%]="getLeft(i)"
                    [style.top.%]="getTop(i)">
            </secret>        
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretsComponent {

    _secrets: ReadonlyArray<Entity>;

	constructor(private logger: NGXLogger) { }

    @Input('secrets') set secrets(value: ReadonlyArray<Entity>) {
        this.logger.debug('[secrets] setting secrets', value);
        this._secrets = value;
    }

    getLeft(i: number): number {
        switch (i) {
            case 0:
                return 31;
            case 1:
                return -2;
            case 2:
                return 64;
            case 3:
                return -17;
            case 4:
                return 75;
        }
        return 0;
    }

    getTop(i: number): number {
        switch (i) {
            case 0:
                return -10;
            case 1:
                return 8;
            case 2:
                return 8;
            case 3:
                return 38;
            case 4:
                return 38;
        }
        return 0;
    }
	
	trackByFn(index, item: Entity) {
		return item.id;
	}
}
