import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Map } from 'immutable';
import { Entity } from '../../models/game/entity';
import { GameTag } from '../../models/enums/game-tags';
import { Zone } from '../../models/enums/zone';
import { CardType } from '../../models/enums/card-type';
import { NGXLogger } from 'ngx-logger';

@Component({
	selector: 'play-area',
	styleUrls: [
        '../../../css/components/game/play-area.component.scss'
    ],
	template: `
        <div class="play-area" [ngClass]="{ 'mulligan': _isMulligan }">
            <hand [entities]="hand" [options]="handOptions" [controller]="playerEntity"></hand>
            <hero 
                    [hero]="hero" 
                    [heroPower]="heroPower" 
                    [weapon]="weapon" 
                    [secrets]="secrets"
                    [options]="heroOptions">
            </hero>
            <board [entities]="board" [options]="boardOptions"></board>
            <mana-tray 
                    [total]="totalCrystals" 
                    [available]="availableCrystals"
                    [empty]="emptyCrystals"
                    [locked]="lockedCrystals"
                    [futureLocked]="futureLockedCrystals">
            </mana-tray>
            <deck [deck]="deck"></deck>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayAreaComponent {

    _isMulligan: string;
    _entities: Map<number, Entity>;
    _playerId: number;

    hand: ReadonlyArray<Entity>;
    handOptions: ReadonlyArray<number>;
    board: ReadonlyArray<Entity>;
    boardOptions: ReadonlyArray<number>;
    deck: ReadonlyArray<Entity>;
    playerEntity: Entity;
    hero: Entity;
    heroOptions: ReadonlyArray<number>;
    heroPower: Entity;
    weapon: Entity;
    secrets: ReadonlyArray<Entity>;

    totalCrystals: number;
    availableCrystals: number;
    emptyCrystals: number;
    lockedCrystals: number;
    futureLockedCrystals: number;

    private _options: ReadonlyArray<number>;

    constructor(private logger: NGXLogger) {}

    @Input('mulligan') set mulligan(value: string) {
        this.logger.debug('[play-area] setting mulligan', value);
        this._isMulligan = value;
    }

    @Input('entities') set entities(entities: Map<number, Entity>) {
        this.logger.debug('[play-area] setting new entities', entities.toJS());
        this._entities = entities;
        this.updateEntityGroups();
    }

    @Input('options') set options(value: ReadonlyArray<number>) {
        this.logger.debug('[play-area] setting options', value);
        this._options = value;
        this.updateEntityGroups();
    }

    @Input('playerId') set playerId(playerId: number) {
        this.logger.debug('[play-area] setting playerId', playerId);
        this._playerId = playerId;
        this.updateEntityGroups();
    }

    private updateEntityGroups() {
        if (!this._entities || ! this._playerId) {
            this.logger.debug('[play-area] entities not initialized yet');
            return;
        }
        
        this.playerEntity = this._entities.find((entity) => entity.getTag(GameTag.PLAYER_ID) === this._playerId);
        this.hand = this.getHandEntities(this._playerId);
        this.handOptions = this.getOptions(this.hand, this._options);
        this.board = this.getBoardEntities(this._playerId);
        this.boardOptions = this.getOptions(this.board, this._options);
        this.deck = this.getDeckEntities(this._playerId);
        this.hero = this.getHeroEntity(this.playerEntity);
        this.heroPower = this.getHeroPowerEntity(this._playerId); 
        this.weapon = this.getWeaponEntity(this._playerId); 
        this.secrets = this.getSecretEntities(this._playerId);
        this.heroOptions = this.getOptions([this.hero, this.heroPower, this.weapon], this._options);

        this.totalCrystals = this.playerEntity.getTag(GameTag.RESOURCES) || 0;
        this.availableCrystals = this.totalCrystals - (this.playerEntity.getTag(GameTag.RESOURCES_USED) || 0);
        this.lockedCrystals = this.playerEntity.getTag(GameTag.OVERLOAD_LOCKED) || 0;
        this.emptyCrystals = this.totalCrystals - this.availableCrystals - this.lockedCrystals;
        this.futureLockedCrystals = this.playerEntity.getTag(GameTag.OVERLOAD_OWED) || 0;
        this.logger.debug('[play-area] play-area entities updated', this.hand);
    }

    private getHandEntities(playerId: number): ReadonlyArray<Entity> {
        return this._entities.toArray()
                .filter((entity) => entity.getTag(GameTag.CONTROLLER) === playerId)
                .filter((entity) => entity.getTag(GameTag.ZONE) === Zone.HAND)
                .sort((a, b) => a.getTag(GameTag.ZONE_POSITION) - b.getTag(GameTag.ZONE_POSITION));
    }

    private getDeckEntities(playerId: number): ReadonlyArray<Entity> {
        return this._entities.toArray()
                .filter((entity) => entity.getTag(GameTag.CONTROLLER) === playerId)
                .filter((entity) => entity.getTag(GameTag.ZONE) === Zone.DECK);
    }

    private getBoardEntities(playerId: number): ReadonlyArray<Entity> {
        return this._entities.toArray()
                .filter((entity) => entity.getTag(GameTag.CONTROLLER) === playerId)
                .filter((entity) => entity.getTag(GameTag.ZONE) === Zone.PLAY)
                .filter((entity) => entity.getTag(GameTag.CARDTYPE) === CardType.MINION)
                .sort((a, b) => a.getTag(GameTag.ZONE_POSITION) - b.getTag(GameTag.ZONE_POSITION));
    }

    private getHeroEntity(playerEntity: Entity): Entity {
        const heroEntityId = playerEntity.getTag(GameTag.HERO_ENTITY);
        return this._entities.get(heroEntityId);
    }

    private getHeroPowerEntity(playerId: number): Entity {
        const heroPower = this._entities.toArray()
                .filter((entity) => entity.getTag(GameTag.CARDTYPE) === CardType.HERO_POWER)
                .filter((entity) => entity.getTag(GameTag.ZONE) === Zone.PLAY)
                .filter((entity) => entity.getTag(GameTag.CONTROLLER) === playerId)
                [0];
        return heroPower;
    }

    private getWeaponEntity(playerId: number): Entity {
        return this._entities.toArray()
                .filter((entity) => entity.getTag(GameTag.CARDTYPE) === CardType.WEAPON)
                .filter((entity) => entity.getTag(GameTag.ZONE) === Zone.PLAY)
                .filter((entity) => entity.getTag(GameTag.CONTROLLER) === playerId)
                [0];
    }

    private getSecretEntities(playerId: number): ReadonlyArray<Entity> {
        return this._entities.toArray()
                .filter((entity) => entity.getTag(GameTag.CONTROLLER) === playerId)
                .filter((entity) => entity.getTag(GameTag.ZONE) === Zone.SECRET)
                .sort((a, b) => a.getTag(GameTag.ZONE_POSITION) - b.getTag(GameTag.ZONE_POSITION));
    }

    private getOptions(zone: ReadonlyArray<Entity>, options: ReadonlyArray<number>): ReadonlyArray<number> {
        return zone
                .filter(entity => entity)
                .map(entity => entity.id)
                .filter(id => options.indexOf(id) !== -1);
    }

}
