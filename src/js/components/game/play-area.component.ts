import { Component, ChangeDetectionStrategy, NgZone, Input } from '@angular/core';
import { Map } from 'immutable';
import { Entity } from '../../models/game/entity';
import { GameTag } from '../../models/enums/game-tags';
import { Zone } from '../../models/enums/zone';
import { CardType } from '../../models/enums/card-type';

@Component({
	selector: 'play-area',
	styleUrls: [
        '../../../css/components/game/play-area.component.scss'
    ],
	template: `
        <div class="play-area">
            <hand [entities]="hand"></hand>
            <hero [hero]="hero" [heroPower]="heroPower" [weapon]="weapon"></hero>
            <board></board>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayAreaComponent {

    _entities: Map<number, Entity>;
    _playerId: number;

    hand: ReadonlyArray<Entity>;
    hero: Entity;
    heroPower: Entity;
    weapon: Entity;

    @Input('entities') set entities(entities: Map<number, Entity>) {
        console.log('[play-area] setting new entities', entities.toJS());
        this._entities = entities;
        this.updateEntityGroups();
    }

    @Input('playerId') set playerId(playerId: number) {
        console.log('[play-area] setting playerId', playerId);
        this._playerId = playerId;
        this.updateEntityGroups();
    }

    private updateEntityGroups() {
        if (!this._entities || ! this._playerId) {
            console.log('[play-area] entities not initialized yet');
            return;
        }
        
        this.hand = this.getHandEntities(this._playerId);
        this.hero = this.getHeroEntity(this._playerId);
        this.heroPower = this.getHeroPowerEntity(this._playerId); 
        this.weapon = this.getWeaponEntity(this._playerId); 
        console.log('[bplay-areaard] hand entities updated', this.hand);
    }

    private getHandEntities(playerId: number): ReadonlyArray<Entity> {
        return this._entities.toArray()
                .filter((entity) => entity.getTag(GameTag.CONTROLLER) == playerId)
                .filter((entity) => entity.getTag(GameTag.ZONE) == Zone.HAND)
                .sort((a, b) => a.getTag(GameTag.ZONE_POSITION) - b.getTag(GameTag.ZONE_POSITION));
    }

    private getHeroEntity(playerId: number): Entity {
        const playerEntity = this._entities.find((entity) => entity.getTag(GameTag.PLAYER_ID) === playerId);
        const heroEntityId = playerEntity.getTag(GameTag.HERO_ENTITY);
        return this._entities.get(heroEntityId);
    }

    private getHeroPowerEntity(playerId: number): Entity {
        return this._entities.toArray()
                .filter((entity) => entity.getTag(GameTag.CARDTYPE) === CardType.HERO_POWER)
                .filter((entity) => entity.getTag(GameTag.ZONE) === Zone.PLAY)
                .filter((entity) => entity.getTag(GameTag.CONTROLLER) === playerId)
                [0];
    }

    private getWeaponEntity(playerId: number): Entity {
        return this._entities.toArray()
                .filter((entity) => entity.getTag(GameTag.CARDTYPE) === CardType.WEAPON)
                .filter((entity) => entity.getTag(GameTag.ZONE) === Zone.PLAY)
                .filter((entity) => entity.getTag(GameTag.CONTROLLER) === playerId)
                [0];
    }

}
