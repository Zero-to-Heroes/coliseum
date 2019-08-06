export interface ChosenTag {
	readonly entity: number;
	readonly playerID: number;
	readonly ts: number;
	readonly cards: readonly number[];
	readonly index: number;
}
