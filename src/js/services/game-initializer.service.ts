import { Injectable } from '@angular/core';
import { HistoryItem } from '../models/history/history-item';
import { Entity } from '../models/game/entity';
import { Game } from '../models/game/game';
import { Map } from 'immutable';
import { CardType } from '../models/enums/card-type';
import { GameHepler } from '../models/game/game-helper';
import { PlayerEntity } from '../models/game/player-entity';

@Injectable()
export class GameInitializerService {

	public initializeGameWithPlayers(history: ReadonlyArray<HistoryItem>, entities: Map<number, Entity>): Game {
        const players: PlayerEntity[] = entities
                .filter((entity: Entity) => entity.getCardType() == CardType.PLAYER)
                .map(entity => entity as PlayerEntity)
                .toArray();
        const firstPlayerHand: ReadonlyArray<Entity> = GameHepler.getPlayerHand(entities, players[0].playerId);
        let player1 = players[0];
        let player2 = players[1];
        // All game modes known today have the main player have at least 3 cards in hand
        if (firstPlayerHand.length < 3 || !firstPlayerHand[0].isRevealed() || !firstPlayerHand[1].isRevealed() || !firstPlayerHand[2].isRevealed()) {
            [player1, player2] = [player2, player1];
        }
        const game = Game.createGame({} as Game, { 
            entities: entities,
            players: [player1, player2],
        });
        return game;
	}

}
