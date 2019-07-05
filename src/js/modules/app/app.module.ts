import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Ng2FittextModule } from "ng2-fittext";
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

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
import { ActionParserService } from '../../services/parser/gamepipeline/action-parser.service';
import { GameInitializerService } from '../../services/parser/gamepipeline/game-initializer.service';
import { GameParserService } from '../../services/parser/game-parser.service';
import { GamePopulationService } from '../../services/parser/entitiespipeline/game-population.service';
import { GameStateParserService } from '../../services/parser/entitiespipeline/game-state-parser.service';
import { StateProcessorService } from '../../services/parser/state-processor.service';
import { TurnParserService } from '../../services/parser/gamepipeline/turn-parser.service';
import { XmlParserService } from '../../services/parser/xml-parser.service';
import { HeroPowerCostComponent } from '../../components/game/hero/hero-power-cost.component';
import { HeroStatsComponent } from '../../components/game/hero/hero-stats.component';
import { ManaTrayComponent } from '../../components/game/manatray/mana-tray.component';
import { TooltipsComponent, Tooltip } from '../../components/tooltips.component';
import { BoardCardFrameComponent } from '../../components/game/board/board-card-frame.component';
import { BoardCardStatsComponent } from '../../components/game/board/board-card-stats.component';
import { NarratorService } from '../../services/parser/gamepipeline/narrator.service';
import { TurnNarratorComponent } from '../../components/turn-narrator.component';
import { MulliganComponent } from '../../components/game/overlay/mulligan.component';
import { OverlayCrossedComponent } from '../../components/game/card/overlay-crossed.component';
import { PlayerNameComponent } from '../../components/game/overlay/player-name.component';
import { ActiveSpellParserService } from '../../services/parser/gamepipeline/active-spell-parser.service';
import { ActiveSpellComponent } from '../../components/game/active-spell.component';
import { MulliganParserService } from '../../services/parser/gamepipeline/mulligan-parser.service';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { TargetZoneComponent } from '../../components/game/target-zone.component';
import { TargetsParserService } from '../../services/parser/gamepipeline/targets-parser.service';
import { CardTooltipDirective } from '../../directives/card-tooltip.directive';
import { CardResizeDirective } from '../../directives/card-resize.directive';
import { DeckComponent } from '../../components/game/deck/deck.component';
import { DamageComponent } from '../../components/game/card/damage.component';
import { CardElementResizeDirective } from '../../directives/card-element-resize.directive';
import { WeaponArtComponent } from '../../components/game/hero/weapon-art.component';
import { WeaponFrameComponent } from '../../components/game/hero/weapon-frame.component';
import { WeaponStatsComponent } from '../../components/game/hero/weapon-stats.component';
import { EndGameParserService } from '../../services/parser/gamepipeline/end-game-parser.service';
import { EndGameComponent } from '../../components/game/overlay/end-game.component';
import { DiscoverComponent } from '../../components/game/overlay/discover.component';
import { OverlayTickedComponent } from '../../components/game/card/overlay-ticked.component';
import { SleepingComponent } from '../../components/game/board/sleeping.component';
import { PowerIndicatorComponent } from '../../components/game/board/power-indicator.component';
import { CardOnBoardOverlaysComponent } from '../../components/game/board/card-on-board-overlays.component';
import { SecretsComponent } from '../../components/game/hero/secrets.component';
import { SecretComponent } from '../../components/game/hero/secret.component';
import { SecretRevealedComponent } from '../../components/game/secret-revealed.component';
import { CardEnchantmentsComponent } from '../../components/game/card/card-enchantments.component';
import { CardEnchantmentComponent } from '../../components/game/card/card-enchantment.component';

@NgModule({
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		Ng2FittextModule,
		LoggerModule.forRoot({ 
			level: process.env.NODE_ENV === 'production' ? NgxLoggerLevel.WARN : NgxLoggerLevel.DEBUG 
        }),
	],
	declarations: [
		AppComponent,
		GameComponent,
		TurnNarratorComponent,
		HandComponent,
		PlayAreaComponent,
		HandComponent,
		ManaTrayComponent,

		BoardComponent,
		CardOnBoardComponent,
		BoardCardFrameComponent,
		BoardCardStatsComponent,
        DamageComponent,
        SleepingComponent,
        PowerIndicatorComponent,
        CardOnBoardOverlaysComponent,
        CardEnchantmentsComponent,
        CardEnchantmentComponent,
		
		TooltipsComponent,
		Tooltip,

		HeroComponent,
		HeroCardComponent,
		HeroArtComponent,
		HeroStatsComponent,
		HeroFrameComponent,
		HeroPowerComponent,
		HeroPowerArtComponent,
		HeroPowerCostComponent,
        HeroPowerFrameComponent,
        
		WeaponComponent,
        WeaponArtComponent,
        WeaponFrameComponent,
        WeaponStatsComponent,

        SecretsComponent,
        SecretComponent,

		CardComponent,
		CardArtComponent,
		CardFrameComponent,
		CardRarityComponent,
		CardNameComponent,
		CardTextComponent,
		CardRaceComponent,
		CardStatsComponent,
        CardCostComponent,
        OverlayCrossedComponent,
        OverlayTickedComponent,
        
        DeckComponent,        
        PlayerNameComponent,
        EndGameComponent,
        
        MulliganComponent,
        DiscoverComponent,
        ActiveSpellComponent,
        SecretRevealedComponent,
        TargetZoneComponent,

        CardTooltipDirective,
        CardResizeDirective,
        CardElementResizeDirective,
    ],
	providers: [
        Location, 
        { provide: LocationStrategy, useClass: PathLocationStrategy },

        ActionParserService,
        ActiveSpellParserService,
		AllCardsService,
		Events,
		GameInitializerService,
		GameParserService,
		GamePopulationService,
        GameStateParserService,
        MulliganParserService,
        EndGameParserService,
		NarratorService,
        StateProcessorService,
        TargetsParserService,
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
