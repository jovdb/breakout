export class Pool {
    used;
    unused;
    constructor() {
        this.used = [];
        this.unused = [];
    }
    /** Add an item */
    add(item) {
        this.used.push(item);
    }
    /** Try get an recycled item */
    recycle() {
        const item = this.unused.pop(); // Remove From unused
        if (item)
            this.used.push(item); // Add to used
        return item;
    }
    /** Release this item as not used so it can be recycled, make sure to cleanup the item first */
    free(item) {
        const index = this.used.indexOf(item);
        if (index >= 0) {
            this.unused.push(...this.used.splice(index, 1)); // Move to unused
        }
    }
    /** Get all items in this pool */
    all() {
        return this.used;
    }
    first(predicate) {
        for (const entity of this.used) {
            if (predicate(entity))
                return entity;
        }
        return undefined;
    }
    filterComponents(...components) {
        return this.used.filter(item => components.every(component => component.isOn(item)));
    }
    /** Cleanup unused items */
    clean() {
        this.unused.splice(0, this.unused.length);
    }
}
// Global pool with all Entities
export const entityPool = new Pool();
//# sourceMappingURL=Pool.js.map