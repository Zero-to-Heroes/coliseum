import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule }    from '@angular/http';

import { AppComponent }  from '../../components/app.component';
import { XmlParserService } from '../../services/xml-parser.service';
import { GamePopulationService } from '../../services/game-population.service';
import { AllCardsService } from '../../services/all-cards.service';
import { GameInitializerService } from '../../services/game-initializer.service';
import { GameStateParserService } from '../../services/game-state-parser.service';

@NgModule({
	imports: [
		BrowserModule,
		HttpModule,
		BrowserAnimationsModule
	],
	declarations: [
		AppComponent
	],
	providers: [
		AllCardsService,
		GameInitializerService,
		GamePopulationService,
		GameStateParserService,
		XmlParserService
	],
	entryComponents: [
		AppComponent
	]
})
export class AppModule {
	ngDoBootstrap() {}
 }
