import { Parser } from "./parser";
import { HistoryItem } from "../../../models/history/history-item";
import { ActionHistoryItem } from "../../../models/history/action-history-item";
import { MulliganCardAction } from "../../../models/action/mulligan-card-action";
import { GameHepler } from "../../../models/game/game-helper";
import { Action } from "../../../models/action/action";
import { AllCardsService } from "../../all-cards.service";
import { GameTag } from "../../../models/enums/game-tags";
import { Zone } from "../../../models/enums/zone";
import { NGXLogger } from "ngx-logger";
import { BlockType } from "../../../models/enums/block-type";
import { Entity } from "../../../models/game/entity";
import { Map } from "immutable";

export class MulliganCardParser implements Parser {

    constructor(private allCards: AllCardsService, private logger: NGXLogger) {}

    public applies(item: HistoryItem): boolean {
        return item instanceof ActionHistoryItem;
    }

    public parse(item: ActionHistoryItem, entities: Map<number, Entity>, currentTurn: number): Action[] {
        if (currentTurn > 0) {
            return;
        }
        // Adding the cards mulliganed by the player
        if (parseInt(item.node.attributes.type) == BlockType.TRIGGER
                && item.node.hideEntities
                && GameHepler.isPlayerEntity(parseInt(item.node.attributes.entity), entities)) {
            return [MulliganCardAction.create(
                {
                    timestamp: item.timestamp,
                    index: item.index,
                    playerMulligan: item.node.hideEntities
                },
                this.allCards)];
        }
        if (parseInt(item.node.attributes.type) == BlockType.TRIGGER 
                && GameHepler.isPlayerEntity(parseInt(item.node.attributes.entity), entities)
                && item.node.tags) {
            return item.node.tags
                .filter((tag) => tag.tag === GameTag.ZONE)
                .filter((tag) => tag.value === Zone.DECK)
                .map((tag) => MulliganCardAction.create(
                    {
                        timestamp: item.timestamp,
                        index: item.index,
                        opponentMulligan: [tag.entity]
                    },
                    this.allCards));
        }
        return null;
    }

    public reduce(actions: ReadonlyArray<Action>): ReadonlyArray<Action> {
        const result: Action[] = [];
        let previousAction: Action;
        for (let i = 0; i < actions.length; i++) {
            const currentAction = actions[i];
            if (previousAction instanceof MulliganCardAction && currentAction instanceof MulliganCardAction) {
                const index = result.indexOf(previousAction);
                previousAction = this.mergeActions(previousAction, currentAction);
                result[index] = previousAction;
            }
            else {
                previousAction = currentAction;
                result.push(currentAction);
            }
        }
        return result;
    }

    private mergeActions(previousAction: MulliganCardAction, currentAction: MulliganCardAction): MulliganCardAction {
        return MulliganCardAction.create(
            {
                timestamp: previousAction.timestamp,
                index: previousAction.index,
                playerMulligan: [...(previousAction.playerMulligan || []), ...(currentAction.playerMulligan || [])],
                opponentMulligan: [...(previousAction.opponentMulligan || []), ...(currentAction.opponentMulligan || [])]
            },
            this.allCards)
    }
}