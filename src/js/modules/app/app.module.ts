import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule }    from '@angular/http';

import { AppComponent }  from '../../components/app.component';
import { XmlParserService } from '../../services/parser/xml-parser.service';
import { GamePopulationService } from '../../services/parser/game-population.service';
import { AllCardsService } from '../../services/all-cards.service';
import { GameInitializerService } from '../../services/parser/game-initializer.service';
import { GameStateParserService } from '../../services/parser/game-state-parser.service';
import { TurnParserService } from '../../services/parser/turn-parser.service';
import { ActionParserService } from '../../services/parser/action-parser.service';
import { StateProcessorService } from '../../services/parser/state-processor.service';
import { HandComponent } from '../../components/game/hand.component';
import { GameComponent } from '../../components/game/game.component';
import { GameParserService } from '../../services/parser/game-parser.service';

@NgModule({
	imports: [
		BrowserModule,
		HttpModule,
		BrowserAnimationsModule
	],
	declarations: [
		AppComponent,
		GameComponent,
		HandComponent,
	],
	providers: [
		ActionParserService,
		AllCardsService,
		GameInitializerService,
		GameParserService,
		GamePopulationService,
		GameStateParserService,
		StateProcessorService,
		TurnParserService,
		XmlParserService
	],
	entryComponents: [
		AppComponent
	]
})
export class AppModule {
	ngDoBootstrap() {}
 }
