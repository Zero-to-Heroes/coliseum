import { Injectable } from '@angular/core';
import { Map } from 'immutable';
import { NGXLogger } from 'ngx-logger';
import { GameTag } from '../../../models/enums/game-tags';
import { Step } from '../../../models/enums/step';
import { ActionTurn } from '../../../models/game/action-turn';
import { Game } from '../../../models/game/game';
import { MulliganTurn } from '../../../models/game/mulligan-turn';
import { PlayerEntity } from '../../../models/game/player-entity';
import { Turn } from '../../../models/game/turn';
import { HistoryItem } from '../../../models/history/history-item';
import { TagChangeHistoryItem } from '../../../models/history/tag-change-history-item';

@Injectable()
export class TurnParserService {
	constructor(private logger: NGXLogger) {}

	public createTurns(game: Game, history: readonly HistoryItem[]): Game {
		let turns: Map<number, Turn> = Map<number, Turn>();
		let turnNumber = 0;
		for (const item of history) {
			if (turnNumber === 0 && this.isMulligan(item, game)) {
				const mulliganTurn: MulliganTurn = this.parseMulliganTurn(item as TagChangeHistoryItem, turns);
				turns = turns.set(0, mulliganTurn);
				turnNumber++;
			} else if (this.isStartOfTurn(item, game)) {
				const turn: ActionTurn = this.parseTurn(turnNumber, item as TagChangeHistoryItem, turns);
				turns = turns.set(turnNumber, turn);
				turnNumber++;
			}
		}
		// this.logger.info('created turns', turns.toJS());
		return Game.createGame(game, { turns: turns });
	}

	private parseTurn(currentTurnNumber: number, item: TagChangeHistoryItem, turns: Map<number, Turn>): ActionTurn {
		const itemIndex = (item as TagChangeHistoryItem).tag.index;
		// Turn 1 is mulligan in the log, while for us mulligan is turn 0
		let turn: ActionTurn = turns.get(currentTurnNumber, Object.assign(new ActionTurn(), {
			turn: `${currentTurnNumber}`,
			timestamp: item.timestamp,
			index: itemIndex,
			activePlayer: undefined,
			actions: [],
		}) as ActionTurn) as ActionTurn;
		turn = Object.assign(new ActionTurn(), turn, { index: Math.max(turn.index, itemIndex) });
		return turn;
	}

	private parseMulliganTurn(item: TagChangeHistoryItem, turns: Map<number, Turn>): MulliganTurn {
		const itemIndex = (item as TagChangeHistoryItem).tag.index;
		let mulliganTurn: MulliganTurn = turns.get(0, Object.assign(new MulliganTurn(), {
			turn: 'mulligan',
			timestamp: item.timestamp,
			index: itemIndex,
			actions: [],
		}) as MulliganTurn) as MulliganTurn;
		mulliganTurn = Object.assign(new MulliganTurn(), mulliganTurn, { index: Math.max(mulliganTurn.index, itemIndex) });
		return mulliganTurn;
	}

	private isMulligan(item: HistoryItem, game: Game) {
		return (
			item instanceof TagChangeHistoryItem &&
			item.tag.tag === GameTag.MULLIGAN_STATE &&
			item.tag.value === 1 &&
			this.isPlayerEntity(item.tag.entity, game)
		);
	}

	private isStartOfTurn(item: HistoryItem, game: Game) {
		return (
			item instanceof TagChangeHistoryItem &&
			this.isGameEntity(item.tag.entity, game) &&
			item.tag.tag === GameTag.STEP &&
			item.tag.value === Step.MAIN_READY
		);
	}

	private isPlayerEntity(entityId: number, game: Game) {
		return game.entities.get(entityId) instanceof PlayerEntity;
	}

	private isGameEntity(entityId: number, game: Game) {
		return entityId === 1;
	}
}
