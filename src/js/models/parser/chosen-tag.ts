export interface ChosenTag {
	readonly entity: number;
	readonly playerID: number;
	readonly ts: number;
	readonly cards: ReadonlyArray<number>;
	readonly index: number;
}
