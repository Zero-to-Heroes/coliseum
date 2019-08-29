import { ErrorHandler, Injectable, ModuleWithProviders, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { captureException, init } from '@sentry/browser';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { GamePopulationService } from '../../services/parser/entitiespipeline/game-population.service';
import { GameStateParserService } from '../../services/parser/entitiespipeline/game-state-parser.service';
import { GameParserService } from '../../services/parser/game-parser.service';
import { ActionParserService } from '../../services/parser/gamepipeline/action-parser.service';
import { ActivePlayerParserService } from '../../services/parser/gamepipeline/active-player-parser.service';
import { ActiveSpellParserService } from '../../services/parser/gamepipeline/active-spell-parser.service';
import { EndGameParserService } from '../../services/parser/gamepipeline/end-game-parser.service';
import { GameInitializerService } from '../../services/parser/gamepipeline/game-initializer.service';
import { MulliganParserService } from '../../services/parser/gamepipeline/mulligan-parser.service';
import { NarratorService } from '../../services/parser/gamepipeline/narrator.service';
import { TargetsParserService } from '../../services/parser/gamepipeline/targets-parser.service';
import { TurnParserService } from '../../services/parser/gamepipeline/turn-parser.service';
import { ImagePreloaderService } from '../../services/parser/image-preloader.service';
import { StateProcessorService } from '../../services/parser/state-processor.service';
import { XmlParserService } from '../../services/parser/xml-parser.service';

console.log('version is ' + process.env.APP_VERSION);
console.log('environment is', process.env.NODE_ENV);

init({
	dsn: 'https://fe35eae785af4971a767bc8d4c1fe791@sentry.io/1532731',
	enabled: process.env.NODE_ENV === 'production',
	release: process.env.APP_VERSION,
});

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
	constructor() {}
	handleError(error) {
		captureException(error.originalError || error);
		throw error;
	}
}

@NgModule({
	imports: [BrowserModule, LoggerModule.forRoot({ level: NgxLoggerLevel.DEBUG })],
	declarations: [],
	entryComponents: [],
	exports: [],
})
export class ParserModule {
	static forRoot(): ModuleWithProviders {
		return {
			ngModule: ParserModule,
			providers: [
				ActionParserService,
				ActivePlayerParserService,
				ActiveSpellParserService,
				GameInitializerService,
				GameParserService,
				GamePopulationService,
				GameStateParserService,
				ImagePreloaderService,
				MulliganParserService,
				EndGameParserService,
				NarratorService,
				StateProcessorService,
				TargetsParserService,
				TurnParserService,
				XmlParserService,
			],
		};
	}
}
