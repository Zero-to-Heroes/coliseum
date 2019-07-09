import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, ElementRef, AfterViewInit, HostListener, ViewRef } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';

@Component({
	selector: 'target-zone',
	styleUrls: [
        '../../../css/components/game/target-zone.component.scss'
    ],
	template: `
        <div class="target-zone" [innerHTML]="svg" [ngClass]="{ 'inactive': !_active }"></div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TargetZoneComponent implements AfterViewInit {

    _targets: ReadonlyArray<[number, number]>;
    _active: boolean;
    svg: SafeHtml;
    
    private width: number;
    private height: number;
    private left: number;
    private top: number;

    private gameEl;

    constructor(
            private logger: NGXLogger, 
            private sanitizer: DomSanitizer,
            private el: ElementRef,
            private cdr: ChangeDetectorRef) { 
        
    } 

    ngAfterViewInit() {
        this.gameEl = this.el.nativeElement.parentNode;
        this.computeParentDimensions();
    }

    @Input('targets') set targets(value: ReadonlyArray<[number, number]>) {
        this.logger.debug('[target-zone] setting targets', value);
        this._targets = value || [];
        this.svg = undefined;
        
        const anyMissingTarget = this.assessTargetsAvailability();
        // We want to wait until the origin / target elements are rendered first
        // The timeout value is totally arbitrary, and should be used only when going 
        // directly to a target game state from a hyperlink
        setTimeout(() => this.drawTargetLines(), anyMissingTarget ? 1000 : 0);
    }

    @Input('active') set active(value: boolean) {
        this.logger.debug('[target-zone] setting active', value);
        this._active = value;
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.computeParentDimensions();
        if (!(<ViewRef>this.cdr).destroyed) {
            this.cdr.detectChanges();
        }
        setTimeout(() => this.drawTargetLines());
    }

    private assessTargetsAvailability(): boolean {
        const allTargetIds: number[] = this._targets
                .reduce((a, b) => a.concat(b), [])
                .filter((v, i, a) => a.indexOf(v) === i); // Keep unique values
        // console.log('all targets', allTargetIds);
        const anyMissingTargetElement = allTargetIds
                .some(targetId => !this.el.nativeElement.parentNode.querySelector(`[data-entity-id="${targetId}"]`));
        // console.log('any missing?', anyMissingTargetElement);
        return anyMissingTargetElement;                
    }

    private computeParentDimensions() {
        this.width = this.el.nativeElement.getBoundingClientRect().width;
        this.height = this.el.nativeElement.getBoundingClientRect().height;
        this.left = this.el.nativeElement.getBoundingClientRect().left;
        this.top = this.el.nativeElement.getBoundingClientRect().top;
        if (!(<ViewRef>this.cdr).destroyed) {
            this.cdr.detectChanges();
        }
    }

    private drawTargetLines() {
        const allPaths = this._targets.map(target => this.drawTargetLine(target[0], target[1]));
        if (allPaths.some(path => !path)) {
            this.logger.error('[targets] missing some elements, not drawing targets');
            return;
        }
        const paths: string = allPaths.join('\n');
        this.svg = this.sanitizer.bypassSecurityTrustHtml(`
            <svg width="${this.width}px" height="${this.height}px" viewBox="0 0 ${this.width} ${this.height}">
                <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" />
                    </marker>
                </defs>
                ${paths}
            </svg>
        `);
        // console.log('built svg', this.svg);
        if (!(<ViewRef>this.cdr).destroyed) {
            this.cdr.detectChanges();
        }
    }

    private drawTargetLine(originId: number, targetId: number): string {
        const originElement = this.gameEl.querySelector(`[data-entity-id="${originId}"]`)
                || this.gameEl.querySelector(`[data-player-entity-id="${originId}"]`);
        const targetElement = this.gameEl.querySelector(`[data-entity-id="${targetId}"]`)
                || this.gameEl.querySelector(`[data-player-entity-id="${targetId}"]`);
        if (!originElement || !targetElement) {
            this.logger.debug('[targets] missing some elements', originElement, originId, targetElement, targetId);
            return null;
        }
        // console.log('drawing arrow between', originElement, originElement.getBoundingClientRect(), targetElement, targetElement.getBoundingClientRect());
        const orX = originElement.getBoundingClientRect().left 
                + originElement.getBoundingClientRect().width / 2 
                - this.left;
        const orY = originElement.getBoundingClientRect().top 
                + originElement.getBoundingClientRect().height / 2
                - this.top;
        const tarX = targetElement.getBoundingClientRect().left 
                + targetElement.getBoundingClientRect().width / 2 
                - this.left;
        const tarY = targetElement.getBoundingClientRect().top 
                + targetElement.getBoundingClientRect().height / 2
                - this.top;
        const svgPath = `
            <line x1="${orX}" y1="${orY}" x2="${tarX}" y2="${tarY}" class="arrow" marker-end="url(#arrow)"/>
        `;
        // console.log('build svgPath', svgPath);
        return svgPath;
    }
}
