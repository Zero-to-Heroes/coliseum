import * as _ from 'lodash';

export enum MetaTags {
	TARGET = 0,
	DAMAGE = 1,
	HEALING = 2,
	JOUST = 3,
}

export const metaTagNames = _.invert(MetaTags);