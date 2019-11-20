import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CardType, GameTag, Zone } from '@firestone-hs/reference-data';
import { Entity } from '@firestone-hs/replay-parser';
import { Map } from 'immutable';
import { NGXLogger } from 'ngx-logger';
import { GameHelper } from '../../../services/game-helper';

@Component({
	selector: 'hero',
	styleUrls: ['../../../../css/components/game/hero/hero.component.scss'],
	template: `
		<div class="hero">
			<weapon [weapon]="_weapon" *ngIf="_weapon"></weapon>
			<hero-card [hero]="_hero" [playerEntity]="playerEntity" [secrets]="_secrets" [option]="isOption(_hero)">
			</hero-card>
			<hero-power [heroPower]="_heroPower" [option]="isOption(_heroPower)"></hero-power>
			<tavern-level-icon *ngIf="tavernLevel > 0" [level]="tavernLevel"></tavern-level-icon>
			<tavern-button
				class="tavern-upgrade"
				*ngIf="tavernUpgradeEntity"
				[entity]="tavernUpgradeEntity"
			></tavern-button>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent {
	_entities: Map<number, Entity>;
	_playerId: number;

	_hero: Entity;
	_heroPower: Entity;
	_weapon: Entity;
	_options: readonly number[];
	_secrets: readonly Entity[];
	_opponentId: number;
	playerEntity: Entity;
	heroOptions: readonly number[];
	tavernLevel: number;
	tavernUpgradeEntity: Entity;

	constructor(private logger: NGXLogger) {}

	@Input('entities') set entities(entities: Map<number, Entity>) {
		this.logger.debug('[hero] setting new entities', entities && entities.toJS());
		this._entities = entities;
		this.updateEntityGroups();
	}

	@Input('playerId') set playerId(playerId: number) {
		this.logger.debug('[hero] setting playerId', playerId);
		this._playerId = playerId;
		this.updateEntityGroups();
	}

	@Input() set opponentId(value: number) {
		this._opponentId = value;
		this.updateEntityGroups();
	}

	@Input('options') set options(value: readonly number[]) {
		this.logger.debug('[hero] setting options', value);
		this._options = value;
	}

	isOption(entity: Entity): boolean {
		return this.heroOptions && entity && this.heroOptions.indexOf(entity.id) !== -1;
	}

	private updateEntityGroups() {
		this.playerEntity =
			this._entities && this._entities.find(entity => entity.getTag(GameTag.PLAYER_ID) === this._playerId);
		this._hero = this.getHeroEntity(this._entities, this.playerEntity);
		// console.log('hero', this._hero, this._hero && this._hero.cardID, this._hero && this._hero.tags.toJS());
		this._heroPower = this.getHeroPowerEntity(this._entities, this._playerId);
		this._weapon = this.getWeaponEntity(this._entities, this._playerId);
		this._secrets = this.getSecretEntities(this._entities, this._playerId);

		// Battlegrounds stuff
		const gameEntity = GameHelper.getGameEntity(this._entities);
		const opponentEntity =
			this._entities && this._entities.find(entity => entity.getTag(GameTag.PLAYER_ID) === this._opponentId);
		this.tavernLevel =
			opponentEntity &&
			this._hero &&
			this._hero.cardID === 'TB_BaconShopBob' &&
			gameEntity.getTag(GameTag.TECH_LEVEL_MANA_GEM) &&
			opponentEntity.getTag(GameTag.PLAYER_TECH_LEVEL)
				? opponentEntity.getTag(GameTag.PLAYER_TECH_LEVEL)
				: 0;
		this.tavernUpgradeEntity =
			this._entities &&
			gameEntity.getTag(GameTag.TECH_LEVEL_MANA_GEM) &&
			this._entities
				.toArray()
				.find(
					entity =>
						entity.getTag(GameTag.GAME_MODE_BUTTON_SLOT) === 3 &&
						entity.getTag(GameTag.CONTROLLER) === this._opponentId,
				);

		this.heroOptions = GameHelper.getOptions(
			[this._hero, this._heroPower, this._weapon, this.tavernUpgradeEntity],
			this._options,
		);
	}

	private getHeroEntity(entities: Map<number, Entity>, playerEntity: Entity): Entity {
		// console.log('getting hero from playerentity', playerEntity, playerEntity.tags.toJS());
		if (!entities || !playerEntity) {
			return null;
		}
		const heroEntityId = playerEntity.getTag(GameTag.HERO_ENTITY);
		const result = entities.get(heroEntityId);
		return result &&
			result.cardID &&
			result.getTag(GameTag.ZONE) === Zone.PLAY &&
			result.cardID !== 'TB_BaconShop_HERO_PH'
			? result
			: null;
	}

	private getHeroPowerEntity(entities: Map<number, Entity>, playerId: number): Entity {
		if (!entities || !playerId) {
			return null;
		}
		const heroPower = entities
			.toArray()
			.filter(entity => entity.getTag(GameTag.CARDTYPE) === CardType.HERO_POWER)
			.filter(entity => entity.getTag(GameTag.ZONE) === Zone.PLAY)
			.filter(entity => entity.getTag(GameTag.CONTROLLER) === playerId)[0];
		return heroPower;
	}

	private getWeaponEntity(entities: Map<number, Entity>, playerId: number): Entity {
		if (!entities || !playerId) {
			return null;
		}
		return entities
			.toArray()
			.filter(entity => entity.getTag(GameTag.CARDTYPE) === CardType.WEAPON)
			.filter(entity => entity.getTag(GameTag.ZONE) === Zone.PLAY)
			.filter(entity => entity.getTag(GameTag.CONTROLLER) === playerId)[0];
	}

	private getSecretEntities(entities: Map<number, Entity>, playerId: number): readonly Entity[] {
		if (!entities || !playerId) {
			return null;
		}
		return entities
			.toArray()
			.filter(entity => entity.getTag(GameTag.CONTROLLER) === playerId)
			.filter(entity => entity.getTag(GameTag.ZONE) === Zone.SECRET)
			.sort((a, b) => a.getTag(GameTag.ZONE_POSITION) - b.getTag(GameTag.ZONE_POSITION));
	}
}
