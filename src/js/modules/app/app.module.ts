import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Ng2FittextModule } from "ng2-fittext";
import { AppComponent } from '../../components/app.component';
import { BoardComponent } from '../../components/game/board/board.component';
import { CardOnBoardComponent } from '../../components/game/board/card-on-board.component';
import { CardArtComponent } from '../../components/game/card/card-art.component';
import { CardCostComponent } from '../../components/game/card/card-cost.component';
import { CardFrameComponent } from '../../components/game/card/card-frame.component';
import { CardNameComponent } from '../../components/game/card/card-name.component';
import { CardRaceComponent } from '../../components/game/card/card-race.component';
import { CardRarityComponent } from '../../components/game/card/card-rarity.component';
import { CardStatsComponent } from '../../components/game/card/card-stats.component';
import { CardTextComponent } from '../../components/game/card/card-text.component';
import { CardComponent } from '../../components/game/card/card.component';
import { GameComponent } from '../../components/game/game.component';
import { HandComponent } from '../../components/game/hand.component';
import { HeroArtComponent } from '../../components/game/hero/hero-art.component';
import { HeroCardComponent } from '../../components/game/hero/hero-card.component';
import { HeroFrameComponent } from '../../components/game/hero/hero-frame.component';
import { HeroPowerArtComponent } from '../../components/game/hero/hero-power-art.component';
import { HeroPowerFrameComponent } from '../../components/game/hero/hero-power-frame.component';
import { HeroPowerComponent } from '../../components/game/hero/hero-power.component';
import { HeroComponent } from '../../components/game/hero/hero.component';
import { WeaponComponent } from '../../components/game/hero/weapon.component';
import { PlayAreaComponent } from '../../components/game/play-area.component';
import { AllCardsService } from '../../services/all-cards.service';
import { Events } from '../../services/events.service';
import { ActionParserService } from '../../services/parser/action-parser.service';
import { GameInitializerService } from '../../services/parser/game-initializer.service';
import { GameParserService } from '../../services/parser/game-parser.service';
import { GamePopulationService } from '../../services/parser/game-population.service';
import { GameStateParserService } from '../../services/parser/game-state-parser.service';
import { StateProcessorService } from '../../services/parser/state-processor.service';
import { TurnParserService } from '../../services/parser/turn-parser.service';
import { XmlParserService } from '../../services/parser/xml-parser.service';


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
		CardOnBoardComponent,
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
		Events,
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
