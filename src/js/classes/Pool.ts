import { IComponent } from "../components/IComponent.js";

export class Pool {

	private used: IEntity[];
	private unused: IEntity[];

	constructor() {
		this.used = [];
		this.unused = [];
	}

	/** Add an item */
	public add(item: IEntity): void {
		this.used.push(item);
	}

	/** Try get an recycled item */
	public recycle(): IEntity | undefined {
		const item = this.unused.pop(); // Remove From unused
		if (item) this.used.push(item); // Add to used
		return item as IMutableEntity;

	}

	/** Release this item as not used so it can be recycled, make sure to cleanup the item first */
	public free(item: IEntity): void {
		const index = this.used.indexOf(item);
		if (index >= 0) {
			this.unused.push(...this.used.splice(index, 1)); // Move to unused
		}
	}

	/** Get all items in this pool */
	public all(): ReadonlyArray<IEntity> {
		return this.used;
	}

	public first<T extends IEntity>(predicate: (entity: IEntity) => entity is T): T | undefined {
		for (const entity of this.used) {
			if (predicate(entity)) return entity;
		}
		return undefined;
	}

	/** Filter pool on components */
	public filterComponents<T extends object>(component: IComponent<T>): (IEntity & T)[];
	public filterComponents<T1 extends object, T2 extends object>(component1: IComponent<T1>, component2: IComponent<T2>): (IEntity & T1 & T2)[];
	public filterComponents<T1 extends object, T2 extends object, T3 extends object>(component1: IComponent<T1>, component2: IComponent<T2>, component3: IComponent<T3>): (IEntity & T1 & T2 & T3)[];
	public filterComponents<T1 extends object, T2 extends object, T3 extends object, T4 extends object>(component1: IComponent<T1>, component2: IComponent<T2>, component3: IComponent<T3>, component4: IComponent<T4>): (IEntity & T1 & T2 & T3 & T4)[];
	public filterComponents<T1 extends object, T2 extends object, T3 extends object, T4 extends object, T5 extends object>(component1: IComponent<T1>, component2: IComponent<T2>, component3: IComponent<T3>, component4: IComponent<T4>, component5: IComponent<T5>): (IEntity & T1 & T2 & T3 & T4 & T5)[];
	public filterComponents(...components: IComponent[]) {
		return this.used.filter(item => components.every(component => component.isOn(item)));
	}

	/** Cleanup unused items */
	public clean(): void {
		this.unused.splice(0, this.unused.length);
	}
}

// Global pool with all Entities
export const entityPool = new Pool();