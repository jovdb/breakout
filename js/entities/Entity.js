/*
╭────────────────────────────────╮
│ Entity                         │
├────────────────────────────────┤
│ label                          │ A free label that can be used to filter or debug
│ id                             │ Global unique ID
├────────────────────────────────┤
│ addComponent()                 │ Add a component to the entity
│ removeComponent()              │ Remove a component from the entity
│ hasComponent()                 │ Check if this entity has the specified component
│ dispose()                      │ Cleanup entity so it can be recycled in a pool
╰────────────────────────────────╯


- Entities can have components
- Components add data to the entity

                                   - Systems query the entities pool for specific components

╭─────────────╮                                         ╭─────────────────╮
│ B A L L     │                                         │                 │
│     ┌───────┴────────┐                     ┌╴╴╴╴╴╴╴╴╴╴└──────┐  V       │
│  E  │ POSITION     ┌─┘                     ╷ POSITION      ┌─┘          │
│     │ x, y         └─┐                     ╵               └─┐  E    S  │
│  N  └───────┬────────┘                     └╴╴╴╴╴╴╴╴╴╴┌──────┘          │
│     ┌───────┴────────╮                                │         L    Y  │
│  T  │ SIZE          ┌┘                                │                 │
│     │ width, height └┐                                │         O    S  │
│  I  └───────┬────────╯                                │                 │
│     ┌───────┴────────╮                     ┌╴╴╴╴╴╴╴╴╴╴└───────╮ C    T  │
│  T  │ VELOCITY       │                     ╷ VELOCITY         │         │
│     │ dx, dy       ┌─╯                     ╵                ┌─╯ I    E  │
│  Y  └───────┬──────┘                       └╴╴╴╴╴╴╴╴╴╴┌─────┘           │
│     ┌───────┴───────╮                                 │         T    M  │
│     │ RENDERABLE   ╭╯                                 │                 │
│     │ canRender    ╰─╮                                │         Y       │
│     └───────┬────────┘                                │                 │
│             │                                         │                 │
╰─────────────╯                                         ╰─────────────────╯

                                                        ╭─────────────────╮
                                                        │                 │
                                             ┌╴╴╴╴╴╴╴╴╴╴└──────┐          │
                                             ╷ POSITION      ┌─┘          │
                                             ╵               └─┐  R    S  │
                                             └╴╴╴╴╴╴╴╴╴╴┌──────┘          │
                                             ┌╴╴╴╴╴╴╴╴╴╴└──────╮  E    Y  │
                                             ╷ SIZE           ┌┘          │
                                             ╵                └┐  N    S  │
                                             └╴╴╴╴╴╴╴╴╴╴┌──────╯          │
                                                        │         D    T  │
                                                        │                 │
                                                        │         E    E  │
                                                        │                 │
                                             ┌╴╴╴╴╴╴╴╴╴╴└──────╮  R    M  │
                                             ╷ RENDERABLE     ╭╯          │
                                             ╵                ╰─╮         │
                                             └╴╴╴╴╴╴╴╴╴╴┌───────┘         │
                                                        │                 │
                                                        ╰─────────────────╯

*/
import { broadcaster } from "../classes/Broadcaster.js";
import { entityPool } from "../classes/Pool.js";
class Entity {
    id;
    label;
    onDispose;
    constructor(label, onDispose) {
        this.label = label;
        this.id = Entity.createNewId();
        this.onDispose = onDispose;
    }
    static reuse(entity, label, onDispose) {
        entity.onDispose?.(entity);
        entity.label = label;
        entity.id = Entity.createNewId();
        entity.onDispose = onDispose;
        return entity;
    }
    addComponents(...components) {
        // Apply the components
        for (const component of components) {
            component.addTo(this);
        }
        return this;
    }
    hasComponents(...components) {
        return components.every(c => c.isOn(this));
    }
    removeComponents(...components) {
        components.forEach(c => {
            c.removeFrom(this);
        });
    }
    /** Cleanup properties and free it from the pool for reuse */
    dispose() {
        // First call dispose method
        if (this.onDispose) {
            this.onDispose(this);
            delete this.onDispose;
        }
        // Remove own properties
        delete this.id;
        delete this.label;
    }
    /** Counter to generate a unique ID */
    static idCounter = 0;
    static createNewId() {
        return (++Entity.idCounter).toString(16);
    }
}
export function isEntity(entity) {
    return entity instanceof Entity;
}
/**
 * Create or recycle from the pool an empty entity, Creation and dispose will be broadcasted
 * To broadcast a message at creation, I needed to add an init function
 */
export function createEntity(label, init) {
    /** Try to recycle Entity from the pool */
    const reusedEntity = entityPool.recycle();
    if (reusedEntity && reusedEntity instanceof Entity) {
        // Call Entity constructor on recycled empty entity
        Entity.reuse(reusedEntity, label, disposeEntity);
        // Execute init callback
        if (init)
            init(reusedEntity);
        // Notify a new Entity is Created
        broadcaster.publish({ name: "EntityCreated", entity: reusedEntity });
        return reusedEntity;
    }
    // Create new and add to the pool
    const newEntity = new Entity(label, disposeEntity);
    // Add the new entity to the pool
    entityPool.add(newEntity);
    // Execute init callback
    if (init)
        init(newEntity);
    // Notify a new Entity is Created
    broadcaster.publish({ name: "EntityCreated", entity: newEntity });
    return newEntity;
}
function disposeEntity(entity) {
    // Notify an Entity will be disposed
    broadcaster.publish({ name: "EntityDispose", entity });
    // Remove all components (HACK: now done by removing all props)
    // Components could hold listen to dispose message and call EntityDispose
    // tslint:disable-next-line:forin
    for (const key in entity) {
        delete entity[key];
    }
    // Free Entity in pool at dispose
    entityPool.free(entity);
}
export function cloneEntity(entity, init) {
    // Create/Recycle a new entity
    return createEntity(entity.label, (newEntity) => {
        // HACK: Because entity has only fields, we can all copy them
        for (const key in entity) {
            if (entity.hasOwnProperty(key)) {
                newEntity[key] = entity[key];
            }
        }
        // ID cannot be cloned, must be unique
        newEntity.id = Entity.createNewId();
        // Add extra initialization
        return init(newEntity);
    });
}
//# sourceMappingURL=Entity.js.map