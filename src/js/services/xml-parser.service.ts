import { Injectable } from '@angular/core';
import { Tag, parser, SAXParser } from 'sax';
import moment from 'moment';
import { Game } from '../models/game';
import { HistoryItem } from '../models/history-item';
import { tagNames, GameTag } from '../models/game-tags';
import { metaTagNames } from '../models/meta-tags';
import { EnrichedTag } from '../models/enriched-tag';
import { EntityDefinition } from '../models/entity-definition';
import { EntityTag } from '../models/entity-tag';
import { ChosenTag } from '../models/chosen-tag';
import { Option } from '../models/option';
import { MetaData } from '../models/metadata';
import { Choices } from '../models/choices';
import { Info } from '../models/info';
import { PlayerHistoryItem } from '../models/player-history-item';
import { ActionHistoryItem } from '../models/action-history-item';
import { TagChangeHistoryItem } from '../models/tag-change-history-item';
import { ChosenEntityHistoryItem } from '../models/chosen-entities-history-item';
import { OptionsHistoryItem } from '../models/options-history-item';
import { GameHistoryItem } from '../models/game-history-item';
import { FullEntityHistoryItem } from '../models/full-entity-history-item';
import { ShowEntityHistoryItem } from '../models/show-entity-history-item';
import { ChangeEntityHistoryItem } from '../models/change-entity-history-item';
import { ChoicesHistoryItem } from '../models/choices-history-item';
import { CardType } from '../models/card-type';

@Injectable()
export class XmlParserService {

    private stack: EnrichedTag[];
    private state: string[];
    private index: number;
    private initialTimestamp: number;
    private history: ReadonlyArray<HistoryItem>;
    private entityDefinition: EntityDefinition;
    private choices: Choices;
    private chosen: ChosenTag;
    private metaData: MetaData;
    private timestamp: number;

    public parseXml(xmlAsString: string): ReadonlyArray<HistoryItem> {
        this.stack = [];
        this.state = ['root'];
        this.index = 0;
        this.history = [];
        this.entityDefinition = {
            tags: {}
        };

        const saxParser: SAXParser = parser(true, {
            trim: true
        });
        saxParser.onopentag = (tag: Tag) => this.onOpenTag(tag);
        saxParser.onclosetag = (tagName: string) => this.onCloseTag();
        saxParser.onerror = (error) => console.error('Error while parsing xml', error);
        saxParser.write(xmlAsString).end();

        console.log('parsed game', this.history);
        return this.history;
    }

    onOpenTag(tag: Tag) {
        this.stack.push(tag);
        if (this[`${this.state[this.state.length - 1]}State`]) {
            this[`${this.state[this.state.length - 1]}State`](tag);
        }
    }

    onCloseTag() {
        const tag = this.stack.pop();
        if (this[`${this.state[this.state.length - 1]}StateClose`]) {
            this[`${this.state[this.state.length - 1]}StateClose`](tag);
        }
    }

    rootState(node: EnrichedTag) {
        node.index = this.index++;
        switch (node.name) {
            case 'Game':
                this.initialTimestamp = this.tsToSeconds(node.attributes.ts);
                this.timestamp = 0;
                break;
            case 'Action':
            case 'Block':
                const ts = this.tsToSeconds(node.attributes.ts);
                const item: ActionHistoryItem = new ActionHistoryItem(node, this.buildTimestamp(ts));
                this.enqueueHistoryItem(item);
                this.state.push('action');
                break;
            case 'ShowEntity':
                this.stack[this.stack.length - 2].showEntities = this.stack[this.stack.length - 2].showEntities || [];
                this.stack[this.stack.length - 2].showEntities.push(this.entityDefinition);
                node['parent'] = this.stack[this.stack.length - 2];
                // Fall-through
            case 'GameEntity':
            case 'Player':
            case 'FullEntity':
            case 'ChangeEntity':
                this.state.push('entity');
				this.entityDefinition.id = parseInt(node.attributes.entity || node.attributes.id);
				this.entityDefinition.attributes = this.entityDefinition.attributes || {};
				this.entityDefinition.attributes.ts = this.tsToSeconds(node.attributes.ts);
				this.entityDefinition.index = this.index++;
                if (node.attributes.cardID) {
					this.entityDefinition.cardID = node.attributes.cardID;
                }
				if (node.attributes.name) {
					this.entityDefinition.name = node.attributes.name;
                }
                break;
            case 'TagChange':
                const tag: EntityTag = {
					entity: parseInt(node.attributes.entity),
					tag: parseInt(node.attributes.tag) as GameTag,
					value: parseInt(node.attributes.value),
					parent: this.stack[this.stack.length - 2],
					index: this.index++
                };
                if (!tag.parent.tags) {
					tag.parent.tags = [];
                }
                tag.parent.tags.push(tag);
                const tagItem: TagChangeHistoryItem = new TagChangeHistoryItem(tag, this.buildTimestamp(ts));
                this.enqueueHistoryItem(tagItem);
                break;
            case 'Options':
                this.state.push('options');
                break;
            case 'ChosenEntities':
                this.chosen = {
                    entity: parseInt(node.attributes.entity),
                    playerID: parseInt(node.attributes.playerID),
                    ts: this.tsToSeconds(node.attributes.ts),
                    cards: [],
                    index: this.index++
                };
                this.state.push('chosenEntities');
                break;
        }
    }

	actionState(node: EnrichedTag) {
		node.index = this.index++;
        const ts = node.attributes.ts ? this.tsToSeconds(node.attributes.ts) : null;
		switch (node.name) {
            case 'ShowEntity':
            case 'FullEntity':
            case 'ChangeEntity':
				this.state.push('entity');
				this.entityDefinition.id = parseInt(node.attributes.entity || node.attributes.id);
				this.entityDefinition.attributes = this.entityDefinition.attributes || {};
				this.entityDefinition.attributes.ts = this.tsToSeconds(node.attributes.ts);
				this.entityDefinition.attributes.triggerKeyword = parseInt(node.attributes.triggerKeyword) || 0;
				this.entityDefinition.index = this.index++;

				if (node.attributes.cardID) {
					this.entityDefinition.cardID = node.attributes.cardID;
                    // this.game.mainPlayer(this.stack[this.stack.length - 2].attributes.entity);
                    console.warn('Not handling main player yet. Should be done as postprocessing step, once replay is parsed');
                }
				if (node.attributes.name) {
					this.entityDefinition.name = node.attributes.name;
                }

				this.entityDefinition.parent = this.stack[this.stack.length - 2];
				if (node.name == 'ShowEntity') {
					this.stack[this.stack.length - 2].showEntities = this.stack[this.stack.length - 2].showEntities || [];
					this.stack[this.stack.length - 2].showEntities.push(this.entityDefinition);
                }
				// Need that to distinguish actions that create tokens
				else if (node.name == 'FullEntity') {
					this.stack[this.stack.length - 2].fullEntities = this.stack[this.stack.length - 2].fullEntities || [];
					this.stack[this.stack.length - 2].fullEntities.push(this.entityDefinition);
                }
                break;
			case 'HideEntity':
				this.entityDefinition.id = parseInt(node.attributes.entity) || parseInt(node.attributes.id);
				this.entityDefinition.index = this.index++;
				this.entityDefinition.parent = this.stack[this.stack.length - 2];

				if (!this.entityDefinition.parent.hideEntities) {
					this.entityDefinition.parent.hideEntities = [];
                }
                this.entityDefinition.parent.hideEntities.push(this.entityDefinition.id);
                break;
			case 'TagChange':
				const tag: EntityTag = {
					entity: parseInt(node.attributes.entity),
					tag: parseInt(node.attributes.tag) as GameTag,
					value: parseInt(node.attributes.value),
					parent: this.stack[this.stack.length - 2],
					index: this.index++
				};
				if (!tag.parent.tags) {
					tag.parent.tags = [];
                }
                tag.parent.tags.push(tag);
                const tagItem: TagChangeHistoryItem = new TagChangeHistoryItem(tag, this.buildTimestamp(ts));
                this.enqueueHistoryItem(tagItem);
                break;
            case 'MetaData':
				this.metaData = {
					meta: metaTagNames[parseInt(node.attributes.meta || node.attributes.entity)],
					data: parseInt(node.attributes.data),
					parent: this.stack[this.stack.length - 2],
                    ts: ts,
                    info: [],
					index: this.index++
				};

				if (!this.metaData.parent.meta) {
					this.metaData.parent.meta = [];
                }
				this.metaData.parent.meta.push(this.metaData);
                this.state.push('metaData');
                break;
            case 'Action':
            case 'Block':
				node.parent = this.stack[this.stack.length - 2];
				node.index = this.index++;
				this.state.push('action');
                const item: ActionHistoryItem = new ActionHistoryItem(node, this.buildTimestamp(ts));
                this.enqueueHistoryItem(item);
                break;
			case 'Choices':
				this.choices = {
					entity: parseInt(node.attributes.entity),
					max: parseInt(node.attributes.max),
					min: parseInt(node.attributes.min),
					playerID: parseInt(node.attributes.playerID),
					source: parseInt(node.attributes.source),
					type: parseInt(node.attributes.type),
					ts: this.tsToSeconds(node.attributes.ts),
					index: this.index++,
					cards: [],
                };
				this.state.push('choices');
                break;
			case 'ChosenEntities':
				this.chosen = {
					entity: parseInt(node.attributes.entity),
					playerID: parseInt(node.attributes.playerID),
					ts: this.tsToSeconds(node.attributes.ts),
					cards: [],
					index: this.index++,
                }
                this.state.push('chosenEntities');
                break;
        }
    }

    actionStateClose(node: EnrichedTag) {
        const ts = node.attributes.ts ? this.tsToSeconds(node.attributes.ts) : null;
        switch (node.name) {
            case 'Action':
            case 'Block':
                this.state.pop();
        }
    }

	blockState(node: EnrichedTag) {
        this.actionState(node);
    }
    
    blockStateClose(node: EnrichedTag) {
        this.actionStateClose(node);
    }

	metaDataState(node: EnrichedTag) {
		switch (node.name) {
			case 'Info':
				const info: Info = {
					entity: parseInt(node.attributes.id || node.attributes.entity),
					parent: this.metaData
				};
                info.parent.info.push(info);
                break;
        }
    }

	metaDataStateClose(node: EnrichedTag) {
        switch (node.name) {
            case 'MetaData':
                this.state.pop()
        }
    }

    chosenEntitiesState(node: EnrichedTag) {
        node.index = this.index++;
        switch (node.name) {
            case 'Choice':
                this.chosen.cards.push(parseInt(node.attributes.entity));
        }
    }

	chosenEntitiesStateClose(node: EnrichedTag) {
		switch (node.name) {
			case 'ChosenEntities':
                this.state.pop();
                const item: ChosenEntityHistoryItem = new ChosenEntityHistoryItem(this.chosen, this.buildTimestamp(this.chosen.ts));
                this.enqueueHistoryItem(item);
        }
    }

	optionsState(node: EnrichedTag) {
		node.index = this.index++
		switch (node.name) {
			case 'Option':
				const option: Option = {
					entity: parseInt(node.attributes.entity),
					optionIndex: parseInt(node.attributes.index),
					error: parseInt(node.attributes.error),
					type: parseInt(node.attributes.type),
					parent: this.stack[this.stack.length - 2],
					index: this.index++
				};
				if (!option.parent.options) {
					option.parent.options = [];
                }
                option.parent.options.push(option);
        }
    }

	optionsStateClose(node: EnrichedTag) {
		switch (node.name) {
			case 'Options':
                this.state.pop();
                const ts = this.tsToSeconds(node.attributes.ts);
                const item: OptionsHistoryItem = new OptionsHistoryItem(node, this.buildTimestamp(ts));
                this.enqueueHistoryItem(item);
        }
    }

	entityState(node: EnrichedTag) {
		node.index = this.index++;
		switch (node.name) {
			case 'Tag':
                this.entityDefinition.tags[tagNames[parseInt(node.attributes.tag)]] = parseInt(node.attributes.value);
        }
    }

    entityStateClose(node: EnrichedTag) {
        const ts = node.attributes.ts ? this.tsToSeconds(node.attributes.ts) : null;
        switch (node.name) {
            case 'GameEntity':
                this.state.pop();
                const gameItem: GameHistoryItem = new GameHistoryItem(this.entityDefinition, this.buildTimestamp(ts));
                this.enqueueHistoryItem(gameItem);
                this.entityDefinition = {tags: {}};
                break;
            case 'Player':
                this.state.pop();
                const playerItem: PlayerHistoryItem = new PlayerHistoryItem(this.entityDefinition, this.buildTimestamp(ts));
                this.enqueueHistoryItem(playerItem);
                this.entityDefinition = {tags: {}};
                break;
            case 'FullEntity':
                this.state.pop();
                const fullEntityItem: FullEntityHistoryItem = new FullEntityHistoryItem(this.entityDefinition, this.buildTimestamp(ts));
                this.enqueueHistoryItem(fullEntityItem);
                this.entityDefinition = {tags: {}};
                break;
            case 'ShowEntity':
                this.state.pop();
                const showEntityItem: ShowEntityHistoryItem = new ShowEntityHistoryItem(this.entityDefinition, this.buildTimestamp(ts));
                this.enqueueHistoryItem(showEntityItem);
                this.entityDefinition = {tags: {}};
                break;
            case 'ChangeEntity':
                this.state.pop();
                const changeEntityItem: ChangeEntityHistoryItem = new ChangeEntityHistoryItem(this.entityDefinition, this.buildTimestamp(ts));
                this.enqueueHistoryItem(changeEntityItem);
                this.entityDefinition = {tags: {}};
                break;
        }
    }

	choicesState(node: EnrichedTag) {
		switch (node.name) {
			case 'Choice':
				this.choices.cards.push(parseInt(node.attributes.entity));
        }
    }

	choicesStateClose(node: EnrichedTag) {
		switch (node.name) {
			case 'Choices':
				this.state.pop();
                const choicesItem: ChoicesHistoryItem = new ChoicesHistoryItem(this.choices, this.buildTimestamp(this.choices.ts));
                this.enqueueHistoryItem(choicesItem);
        }
    }

    private buildTimestamp(ts?: number): number {
        ts = ts || this.timestamp;
        this.timestamp = ts;
        return this.timestamp;
    }
                
    private enqueueHistoryItem(item: HistoryItem) {
        if (item.timestamp === undefined) {
            console.error("History item doesn't have timestamp", item);
            throw new Error("History item doesn't have timestamp" + item);
        }
        this.history = [...this.history || [], item];
    }

    private tsToSeconds(ts: string): number {
        return moment(ts, ['HH:mm:ss.SSSSSSSSS']).unix() - (this.initialTimestamp || 0);
    }
}
