import { Injectable } from '@angular/core';
import { Tag, parser, SAXParser } from 'sax';
import { Map } from 'immutable';

import moment from 'moment';
import { HistoryItem } from '../../models/history/history-item';
import { EnrichedTag } from '../../models/parser/enriched-tag';
import { EntityDefinition } from '../../models/parser/entity-definition';
import { EntityTag } from '../../models/parser/entity-tag';
import { ChosenTag } from '../../models/parser/chosen-tag';
import { Option } from '../../models/parser/option';
import { MetaData } from '../../models/parser/metadata';
import { Choices } from '../../models/parser/choices';
import { Info } from '../../models/parser/info';
import { PlayerHistoryItem } from '../../models/history/player-history-item';
import { ActionHistoryItem } from '../../models/history/action-history-item';
import { TagChangeHistoryItem } from '../../models/history/tag-change-history-item';
import { ChosenEntityHistoryItem } from '../../models/history/chosen-entities-history-item';
import { OptionsHistoryItem } from '../../models/history/options-history-item';
import { GameHistoryItem } from '../../models/history/game-history-item';
import { FullEntityHistoryItem } from '../../models/history/full-entity-history-item';
import { ShowEntityHistoryItem } from '../../models/history/show-entity-history-item';
import { ChangeEntityHistoryItem } from '../../models/history/change-entity-history-item';
import { ChoicesHistoryItem } from '../../models/history/choices-history-item';
import { EntityDefinitionAttribute } from '../../models/parser/entity-definition-attribute';
import { GameTag } from '../../models/enums/game-tags';
import { MetaTags } from '../../models/enums/meta-tags';
import { NGXLogger } from 'ngx-logger';

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

    constructor(private logger: NGXLogger) { }

    public parseXml(xmlAsString: string): ReadonlyArray<HistoryItem> {
        this.reset();
        const saxParser: SAXParser = parser(true, {
            trim: true
        });
        saxParser.onopentag = (tag: Tag) => this.onOpenTag(tag);
        saxParser.onclosetag = (tagName: string) => this.onCloseTag();
        saxParser.onerror = (error) => this.logger.error('Error while parsing xml', error);
        saxParser.write(xmlAsString).end();
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
                const item: ActionHistoryItem = new ActionHistoryItem(node, this.buildTimestamp(ts), node.index);
                this.enqueueHistoryItem(item);
                this.state.push('action');
                break;
            case 'ShowEntity':
                let showEntities: ReadonlyArray<EntityDefinition> = this.stack[this.stack.length - 2].showEntities || [];
                showEntities = [...showEntities, this.entityDefinition];
                this.stack[this.stack.length - 2].showEntities = showEntities;
                // Fall-through
            case 'GameEntity':
            case 'Player':
            case 'FullEntity':
            case 'ChangeEntity':
                this.state.push('entity');
                const attributes = Object.assign({}, this.entityDefinition.attributes, { ts: this.tsToSeconds(node.attributes.ts) });
                const newAttributes: EntityDefinition = {
                    id: parseInt(node.attributes.entity || node.attributes.id),
                    attributes: attributes,
                    index: this.index++,
                    cardID: node.attributes.cardID,
                    name: node.attributes.name,
                    tags: this.entityDefinition.tags, // Avoid the hassle of merging tags, just get the ones from source
                    playerID: parseInt(node.attributes.playerID)
                };
                Object.assign(this.entityDefinition, newAttributes);
                break;
            case 'TagChange':
                const tag: EntityTag = {
					index: this.index++,
					entity: parseInt(node.attributes.entity),
					tag: parseInt(node.attributes.tag) as GameTag,
					value: parseInt(node.attributes.value),
					parentIndex: this.stack[this.stack.length - 2].index,
                };
                let parentTags: ReadonlyArray<EntityTag> = this.stack[this.stack.length - 2].tags || [];
                parentTags = [...parentTags, tag];
                this.stack[this.stack.length - 2].tags = parentTags;
                const tagItem: TagChangeHistoryItem = new TagChangeHistoryItem(tag, this.buildTimestamp(ts), node.index);
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
                const attributes: EntityDefinitionAttribute = Object.assign(
                    {}, 
                    this.entityDefinition.attributes, 
                    { ts: this.tsToSeconds(node.attributes.ts), triggerKeyword: parseInt(node.attributes.triggerKeyword) || 0 });
                const newAttributes: EntityDefinition = {
                    id: parseInt(node.attributes.entity || node.attributes.id),
                    index: this.index++,
                    attributes: attributes,
                    cardID: node.attributes.cardID,
                    name: node.attributes.name,
                    tags: this.entityDefinition.tags, // Avoid the hassle of merging tags, just get the ones from source
                    playerID: parseInt(node.attributes.playerID),
                    parentIndex: this.stack[this.stack.length - 2].index,
                }
                Object.assign(this.entityDefinition, newAttributes);

				if (node.name == 'ShowEntity') {
                    let showEntities: ReadonlyArray<EntityDefinition> = this.stack[this.stack.length - 2].showEntities || [];
                    showEntities = [...showEntities, this.entityDefinition];
                    this.stack[this.stack.length - 2].showEntities = showEntities;
                }
				// Need that to distinguish actions that create tokens
				else if (node.name == 'FullEntity') {
					let fullEntities: ReadonlyArray<EntityDefinition> = this.stack[this.stack.length - 2].fullEntities || [];
                    fullEntities = [...fullEntities, this.entityDefinition];
                    this.stack[this.stack.length - 2].fullEntities = fullEntities;
                }
                break;
			case 'HideEntity':
                const hideAttributes: EntityDefinition = {
                    id: parseInt(node.attributes.entity || node.attributes.id),
                    index: this.index++,
                    parentIndex: this.stack[this.stack.length - 2].index,
                    tags: this.entityDefinition.tags, // Avoid the hassle of merging tags, just get the ones from source
                }
                Object.assign(this.entityDefinition, hideAttributes);

                let hideEntities: ReadonlyArray<number> = this.stack[this.stack.length - 2].hideEntities || [];
                hideEntities = [...hideEntities, this.entityDefinition.id];
                this.stack[this.stack.length - 2].hideEntities = hideEntities;
                break;
			case 'TagChange':
				const tag: EntityTag = {
					index: this.index++,
					entity: parseInt(node.attributes.entity),
					tag: parseInt(node.attributes.tag) as GameTag,
					value: parseInt(node.attributes.value),
					parentIndex: this.stack[this.stack.length - 2].index,
				};
                let parentTags: ReadonlyArray<EntityTag> = this.stack[this.stack.length - 2].tags || [];
                parentTags = [...parentTags, tag];
                this.stack[this.stack.length - 2].tags = parentTags;
                const tagItem: TagChangeHistoryItem = new TagChangeHistoryItem(tag, this.buildTimestamp(ts), node.index);
                this.enqueueHistoryItem(tagItem);
                break;
            case 'MetaData':
				this.metaData = {
					meta: MetaTags[parseInt(node.attributes.meta || node.attributes.entity)],
					data: parseInt(node.attributes.data),
					parentIndex: this.stack[this.stack.length - 2].index,
                    ts: ts,
                    info: [],
					index: this.index++
				};
                let parentMeta: ReadonlyArray<MetaData> = this.stack[this.stack.length - 2].meta || [];
                parentMeta = [...parentMeta, this.metaData];
                this.stack[this.stack.length - 2].meta = parentMeta;
                this.state.push('metaData');
                break;
            case 'Action':
            case 'Block':
                node.parentIndex = this.stack[this.stack.length - 2].index;
				this.state.push('action');
                const item: ActionHistoryItem = new ActionHistoryItem(node, this.buildTimestamp(ts), node.index);
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
        switch (node.name) {
            case 'Action':
            case 'Block':
                this.state.pop();
        }
    }

	blockState(node: EnrichedTag) {
        node.index = this.index++;
        this.actionState(node);
    }
    
    blockStateClose(node: EnrichedTag) {
        this.actionStateClose(node);
    }

	metaDataState(node: EnrichedTag) {
        node.index = this.index++;
		switch (node.name) {
            case 'Info':
                const info: Info = {
                    entity: parseInt(node.attributes.id || node.attributes.entity),
                    parent: this.metaData
                };
                let infos: ReadonlyArray<Info> = this.metaData.info;
                infos = [...infos, info];
                Object.assign(this.metaData, { info: infos });
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
                let cards: ReadonlyArray<number> = this.chosen.cards;
                cards = [...cards, parseInt(node.attributes.entity)];
                Object.assign(this.chosen, {cards: cards});
        }
    }

	chosenEntitiesStateClose(node: EnrichedTag) {
		switch (node.name) {
			case 'ChosenEntities':
                this.state.pop();
                const item: ChosenEntityHistoryItem = new ChosenEntityHistoryItem(this.chosen, this.buildTimestamp(this.chosen.ts), node.index);
                this.enqueueHistoryItem(item);
        }
    }

	optionsState(node: EnrichedTag) {
        node.index = this.index++;
		switch (node.name) {
			case 'Option':
				const option: Option = {
					entity: parseInt(node.attributes.entity),
					optionIndex: parseInt(node.attributes.index),
					error: parseInt(node.attributes.error),
					type: parseInt(node.attributes.type),
					parentIndex: this.stack[this.stack.length - 2].index,
					index: this.index++
                };
                let options: ReadonlyArray<Option> = this.stack[this.stack.length - 2].options || [];
                options = [...options, option];
                this.stack[this.stack.length - 2].options = options;
        }
    }

	optionsStateClose(node: EnrichedTag) {
		switch (node.name) {
			case 'Options':
                this.state.pop();
                const ts = this.tsToSeconds(node.attributes.ts);
                const item: OptionsHistoryItem = new OptionsHistoryItem(node, this.buildTimestamp(ts), node.index);
                this.enqueueHistoryItem(item);
        }
    }

	entityState(node: EnrichedTag) {
        node.index = this.index++;
		switch (node.name) {
            case 'Tag':
                const newTags: Map<string, number> = 
                        this.entityDefinition.tags.set(GameTag[parseInt(node.attributes.tag)], parseInt(node.attributes.value));
                Object.assign(this.entityDefinition, { tags: newTags });
        }
    }

    entityStateClose(node: EnrichedTag) {
        const ts = node.attributes.ts ? this.tsToSeconds(node.attributes.ts) : null;
        switch (node.name) {
            case 'GameEntity':
                this.state.pop();
                const gameItem: GameHistoryItem = new GameHistoryItem(this.entityDefinition, this.buildTimestamp(ts), node.index);
                this.enqueueHistoryItem(gameItem);
                this.entityDefinition = { tags: Map() };
                break;
            case 'Player':
                this.state.pop();
                const playerItem: PlayerHistoryItem = new PlayerHistoryItem(this.entityDefinition, this.buildTimestamp(ts), node.index);
                this.enqueueHistoryItem(playerItem);
                this.entityDefinition = { tags: Map() };
                break;
            case 'FullEntity':
                this.state.pop();
                const fullEntityItem: FullEntityHistoryItem = new FullEntityHistoryItem(this.entityDefinition, this.buildTimestamp(ts), node.index);
                this.enqueueHistoryItem(fullEntityItem);
                this.entityDefinition = { tags: Map() };
                break;
            case 'ShowEntity':
                this.state.pop();
                const showEntityItem: ShowEntityHistoryItem = new ShowEntityHistoryItem(this.entityDefinition, this.buildTimestamp(ts), node.index);
                this.enqueueHistoryItem(showEntityItem);
                this.entityDefinition = { tags: Map() };
                break;
            case 'ChangeEntity':
                this.state.pop();
                const changeEntityItem: ChangeEntityHistoryItem = new ChangeEntityHistoryItem(this.entityDefinition, this.buildTimestamp(ts), node.index);
                this.enqueueHistoryItem(changeEntityItem);
                this.entityDefinition = { tags: Map() };
                break;
        }
    }

	choicesState(node: EnrichedTag) {
        node.index = this.index++;
		switch (node.name) {
            case 'Choice':
                let cards = this.choices.cards || [];
                cards = [...cards, parseInt(node.attributes.entity)];
                Object.assign(this.choices, { cards: cards });
        }
    }

	choicesStateClose(node: EnrichedTag) {
		switch (node.name) {
			case 'Choices':
				this.state.pop();
                const choicesItem: ChoicesHistoryItem = new ChoicesHistoryItem(this.choices, this.buildTimestamp(this.choices.ts), node.index);
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
            this.logger.error("History item doesn't have timestamp", item);
            throw new Error("History item doesn't have timestamp" + item);
        }
        this.history = [...this.history || [], item];
    }

    private reset() {
        this.stack = [];
        this.state = ['root'];
        this.index = 0;
        this.history = [];
        this.entityDefinition = {
            tags: Map()
        };
    }

    private tsToSeconds(ts: string): number {
        return moment(ts, ['HH:mm:ss.SSSSSSSSS']).unix() - (this.initialTimestamp || 0);
    }
}
