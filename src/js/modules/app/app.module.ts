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
import { PlayAreaComponent } from '../../components/game/play-area.component';
import { CardComponent } from '../../components/game/card/card.component';
import { CardArtComponent } from '../../components/game/card/card-art.component';
import { CardFrameComponent } from '../../components/game/card/card-frame.component';
import { CardRarityComponent } from '../../components/game/card/card-rarity.component';
import { CardNameComponent } from '../../components/game/card/card-name.component';
import { CardTextComponent } from '../../components/game/card/card-text.component';
import { CardRaceComponent } from '../../components/game/card/card-race.component';
import { CardStatsComponent } from '../../components/game/card/card-stats.component';
import { CardCostComponent } from '../../components/game/card/card-cost.component';
import { BoardComponent } from 'src/js/components/game/board.component';
import { HeroComponent } from 'src/js/components/game/hero/hero.component';
import { HeroCardComponent } from 'src/js/components/game/hero/hero-card.component';
import { HeroPowerComponent } from 'src/js/components/game/hero/hero-power.component';
import { WeaponComponent } from 'src/js/components/game/hero/weapon.component';
import { HeroArtComponent } from 'src/js/components/game/hero/hero-art.component';
import { HeroFrameComponent } from 'src/js/components/game/hero/hero-frame.component';
import { HeroPowerArtComponent } from 'src/js/components/game/hero/hero-power-art.component';
import { HeroPowerFrameComponent } from 'src/js/components/game/hero/hero-power-frame.component';

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
		PlayAreaComponent,
		HandComponent,
		BoardComponent,
		HeroComponent,
		HeroPowerComponent,
		HeroCardComponent,
		HeroArtComponent,
		HeroFrameComponent,
		HeroPowerArtComponent,
		HeroPowerFrameComponent,
		WeaponComponent,
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
