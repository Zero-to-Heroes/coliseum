import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CardType, GameTag, Zone } from '@firestone-hs/reference-data';
import { Entity } from '@firestone-hs/replay-parser';
import { Map } from 'immutable';
import { GameConfService } from '../../../services/game-conf.service';
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
				[option]="isOption(tavernUpgradeEntity)"
				[shouldAnimate]="shouldAnimate(tavernUpgradeEntity)"
			></tavern-button>
			<tavern-button
				class="tavern-reroll"
				*ngIf="tavernRerollEntity"
				[entity]="tavernRerollEntity"
				[option]="isOption(tavernRerollEntity)"
				[shouldAnimate]="shouldAnimate(tavernRerollEntity)"
			></tavern-button>
			<tavern-button
				class="tavern-freeze"
				*ngIf="tavernFreezeEntity"
				[entity]="tavernFreezeEntity"
				[option]="isOption(tavernFreezeEntity)"
				[shouldAnimate]="shouldAnimate(tavernFreezeEntity)"
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
	tavernRerollEntity: Entity;
	tavernFreezeEntity: Entity;
	_entitiesToAnimate: readonly number[];

	constructor(private conf: GameConfService) {}

	@Input('entities') set entities(entities: Map<number, Entity>) {
		// console.log('[hero] setting new entities', entities && entities.toJS());
		this._entities = entities;
		this.updateEntityGroups();
	}

	@Input('playerId') set playerId(playerId: number) {
		// console.log('[hero] setting playerId', playerId);
		this._playerId = playerId;
		this.updateEntityGroups();
	}

	@Input() set opponentId(value: number) {
		this._opponentId = value;
		this.updateEntityGroups();
	}

	@Input('options') set options(value: readonly number[]) {
		// this.logger.info('[hero] setting options', value);
		this._options = value;
		this.updateEntityGroups();
	}

	@Input() set entitiesToAnimate(value: readonly number[]) {
		this._entitiesToAnimate = value;
		this.updateEntityGroups();
	}

	isOption(entity: Entity): boolean {
		const result = this.heroOptions && entity && this.heroOptions.indexOf(entity.id) !== -1;
		// console.log('is option', entity && entity.id, result, this.heroOptions, entity);
		return result;
	}

	shouldAnimate(entity: Entity) {
		return entity && this._entitiesToAnimate && this._entitiesToAnimate.indexOf(entity.id) !== -1;
	}

	private updateEntityGroups() {
		if (!this._playerId || !this._entities) {
			return;
		}
		this.playerEntity =
			this._entities &&
			this._entities.find(
				entity =>
					entity.getTag(GameTag.PLAYER_ID) === this._playerId &&
					entity.getTag(GameTag.CARDTYPE) === CardType.PLAYER,
			);
		this._hero = this.getHeroEntity(this._entities, this.playerEntity);
		this._heroPower = this.getHeroPowerEntity(this._entities, this._playerId);
		this._weapon = this.getWeaponEntity(this._entities, this._playerId);
		this._secrets = this.getSecretEntities(this._entities, this._playerId);

		// Battlegrounds stuff
		const opponentEntity =
			this._entities && this._entities.find(entity => entity.getTag(GameTag.PLAYER_ID) === this._opponentId);
		this.tavernLevel =
			opponentEntity &&
			this._hero &&
			this._hero.cardID === 'TB_BaconShopBob' &&
			this.conf.isBattlegrounds() &&
			opponentEntity.getTag(GameTag.PLAYER_TECH_LEVEL)
				? opponentEntity.getTag(GameTag.PLAYER_TECH_LEVEL)
				: 0;
		this.tavernUpgradeEntity = GameHelper.getTavernButton(this._entities, this._opponentId, 3);
		this.tavernRerollEntity = GameHelper.getTavernButton(this._entities, this._opponentId, 2);
		this.tavernFreezeEntity = GameHelper.getTavernButton(this._entities, this._opponentId, 1);
		// console.log('freeze id', this.tavernFreezeEntity && this.tavernFreezeEntity.id, this.tavernFreezeEntity);

		this.heroOptions = GameHelper.getOptions(
			[
				this._hero,
				this._heroPower,
				this._weapon,
				this.tavernUpgradeEntity,
				this.tavernRerollEntity,
				this.tavernFreezeEntity,
			],
			this._options,
		);
		// console.log('hero options', this.heroOptions);
	}

	private getHeroEntity(entities: Map<number, Entity>, playerEntity: Entity): Entity {
		// console.log('getting hero from playerentity', playerEntity, playerEntity?.tags?.toJS());
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
