import { Damage } from "./damage";

export interface HasDamage {
    readonly damages: ReadonlyArray<Damage>;
}