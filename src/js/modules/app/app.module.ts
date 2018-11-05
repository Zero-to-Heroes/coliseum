import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule } from '@angular/http';
import {Ng2FittextModule} from "ng2-fittext";

import { AppComponent } from '../../components/app.component';
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
import { BoardComponent } from '../../components/game/board.component';
import { CardComponent } from '../../components/game/card/card.component';
import { CardArtComponent } from '../../components/game/card/card-art.component';
import { CardFrameComponent } from '../../components/game/card/card-frame.component';
import { CardRarityComponent } from '../../components/game/card/card-rarity.component';
import { CardNameComponent } from '../../components/game/card/card-name.component';
import { CardTextComponent } from '../../components/game/card/card-text.component';
import { CardRaceComponent } from '../../components/game/card/card-race.component';
import { CardStatsComponent } from '../../components/game/card/card-stats.component';
import { CardCostComponent } from '../../components/game/card/card-cost.component';

@NgModule({
	imports: [
		BrowserModule,
		HttpModule,
		BrowserAnimationsModule,
		Ng2FittextModule,
	],
	declarations: [
		AppComponent,
		GameComponent,
		HandComponent,
		BoardComponent,
		HandComponent,
		CardComponent,
		CardArtComponent,
		CardFrameComponent,
		CardRarityComponent,
		CardNameComponent,
		CardTextComponent,
		CardRaceComponent,
		CardStatsComponent,
		CardCostComponent,
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
