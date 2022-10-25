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


- Enitities can have components
- Components add data to the entity

                                   - Systems query the enities pool for specific components

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

import { broadcaster } from "../classes/Broadcaster";
import { entityPool } from "../classes/Pool";

declare global {

	/** An Entity were we cannot add/remove components dynamically */
	interface IEntity<TLabel extends string = string> {

		/** label of this entity */
		label: TLabel;

		/** ID for lookup */
		id: string;

		/** Check if this entity has the specified components */
		hasComponents<TProps extends object = {}>(component: IComponent<TProps>): this is TProps;
		hasComponents<TProp1 extends object = {}, TProp2 extends object = {}>(component1: IComponent<TProp1>, component2: IComponent<TProp2>): this is TProp1 & TProp2;
		hasComponents<TProp1 extends object = {}, TProp2 extends object = {}, TProp3 extends object = {}>(component1: IComponent<TProp1>, component2: IComponent<TProp2>, component3: IComponent<TProp3>): this is TProp1 & TProp2 & TProp3;

		/** Cleanup entity so it can be recycled in a pool */
		dispose(): void; // added dispose on the object so caller should not now from which pool it must be removed
	}


	/** An Entity were we can add components dynamically */
	interface IMutableEntity<TLabel extends string = string> extends IEntity<TLabel> {

		/** Add components to an entity */
		addComponents<TProps extends object = {}>(component: IComponent<TProps>): this & TProps;
		addComponents<TProps1 extends object = {}, TProps2 extends object = {}>(component1: IComponent<TProps1>, component2: IComponent<TProps2>): this & TProps1 & TProps2;
		addComponents<TProps1 extends object = {}, TProps2 extends object = {}, TProps3 extends object = {}>(component1: IComponent<TProps1>, component2: IComponent<TProps2>, component3: IComponent<TProps3>): this & TProps1 & TProps2 & TProps3;
		addComponents<TProps1 extends object = {}, TProps2 extends object = {}, TProps3 extends object = {}, TProps4 extends object = {}>(component1: IComponent<TProps1>, component2: IComponent<TProps2>, component3: IComponent<TProps3>, component4: IComponent<TProps4>): this & TProps1 & TProps2 & TProps3 & TProps4;
		addComponents<TProps1 extends object = {}, TProps2 extends object = {}, TProps3 extends object = {}, TProps4 extends object = {}, TProps5 extends object = {}>(component1: IComponent<TProps1>, component2: IComponent<TProps2>, component3: IComponent<TProps3>, component4: IComponent<TProps4>, component5: IComponent<TProps5>): this & TProps1 & TProps2 & TProps3 & TProps4 & TProps5;
		addComponents<TProps1 extends object = {}, TProps2 extends object = {}, TProps3 extends object = {}, TProps4 extends object = {}, TProps5 extends object = {}, TProps6 extends object = {}>(component1: IComponent<TProps1>, component2: IComponent<TProps2>, component3: IComponent<TProps3>, component4: IComponent<TProps4>, component5: IComponent<TProps5>, component6: IComponent<TProps6>): this & TProps1 & TProps2 & TProps3 & TProps4 & TProps5 & TProps6;


		/** Remove components from the entity */
		removeComponents(...components: IComponent[]): void;

	}

	// Augment MessageMap
	interface MessageMap {
		"EntityCreated": { name: "EntityCreated"; entity: IEntity };
		"EntityDispose": { name: "EntityDispose"; entity: IEntity };
	}
}

class Entity<TLabel extends string = ""> implements IEntity<TLabel> {

	public id: string;
	public label: TLabel;

	private onDispose?: (entity: IEntity<TLabel>) => void;

	constructor(label: TLabel, onDispose?: (entity: IEntity<TLabel>) => void) {
		this.label = label;
		this.id = Entity.createNewId();
		this.onDispose = onDispose;
	}

	public addComponents<TProps extends object = {}>(component: IComponent<TProps>): this & TProps;
	public addComponents<TProps1 extends object = {}, TProps2 extends object = {}>(component1: IComponent<TProps1>, component2: IComponent<TProps2>): this & TProps1 & TProps2;
	public addComponents<TProps1 extends object = {}, TProps2 extends object = {}, TProps3 extends object = {}>(component1: IComponent<TProps1>, component2: IComponent<TProps2>, component3: IComponent<TProps3>): this & TProps1 & TProps2 & TProps3;
	public addComponents<TProps1 extends object = {}, TProps2 extends object = {}, TProps3 extends object = {}, TProps4 extends object = {}>(component1: IComponent<TProps1>, component2: IComponent<TProps2>, component3: IComponent<TProps3>, component4: IComponent<TProps4>): this & TProps1 & TProps2 & TProps3 & TProps4;
	public addComponents<TProps1 extends object = {}, TProps2 extends object = {}, TProps3 extends object = {}, TProps4 extends object = {}, TProps5 extends object = {}>(component1: IComponent<TProps1>, component2: IComponent<TProps2>, component3: IComponent<TProps3>, component4: IComponent<TProps4>, component5: IComponent<TProps5>): this & TProps1 & TProps2 & TProps3 & TProps4 & TProps5;
	public addComponents<TProps1 extends object = {}, TProps2 extends object = {}, TProps3 extends object = {}, TProps4 extends object = {}, TProps5 extends object = {}, TProps6 extends object = {}>(component1: IComponent<TProps1>, component2: IComponent<TProps2>, component3: IComponent<TProps3>, component4: IComponent<TProps4>, component5: IComponent<TProps5>, component6: IComponent<TProps6>): this & TProps1 & TProps2 & TProps3 & TProps4 & TProps5 & TProps6;
	public addComponents(...components: IComponent[]): this {
		// Apply the components
		for (const component of components) {
			component.addTo(this);
		}
		return this;
	}

	public hasComponents<TProps extends object = {}>(component: IComponent<TProps>): this is TProps;
	public hasComponents<TProp1 extends object = {}, TProp2 extends object = {}>(component1: IComponent<TProp1>, component2: IComponent<TProp2>): this is TProp1 & TProp2;
	public hasComponents<TProp1 extends object = {}, TProp2 extends object = {}, TProp3 extends object = {}>(component1: IComponent<TProp1>, component2: IComponent<TProp2>, component3: IComponent<TProp3>): this is TProp1 & TProp2 & TProp3;
	public hasComponents(...components: IComponent[]): boolean {
		return components.every(c => c.isOn(this as any));
	}

	public removeComponents(...components: IComponent[]): void {
		components.forEach(c => {
			c.removeFrom(this);
		});
	}

	/** Cleanup properties and free it from the pool for reuse */
	public dispose() {

		// First call dispose method
		if (this.onDispose) {
			this.onDispose(this as any);
			delete this.onDispose;
		}

		// Remove own properties
		delete this.id;
		delete this.label;
	}

	/** Counter to generate a unique ID */
	private static idCounter = 0;
	public static createNewId() {
		return (++Entity.idCounter).toString(16);
	}
}

export function isEntity(entity: any): entity is IEntity {
	return entity instanceof Entity;
}


/**
 * Create or recycle from the pool an empty entity, Creation and dispose will be broadcasted
 * To broadcast a message at creation, I needed to add an init function
 */
export function createEntity<TLabel extends string, TEntity extends IEntity<TLabel>>(label: TLabel, init: (entity: IMutableEntity<TLabel>) => TEntity): TEntity {

	/** Try to recycle Entity from the pool */
	const reusedEntity = entityPool.recycle();
	if (reusedEntity && reusedEntity instanceof Entity) {

		// Call Entity constructor on recycled empty entity
		Entity.call(reusedEntity, label, disposeEntity);

		// Execute init callback
		if (init) init(reusedEntity);

		// Notify a new Entity is Created
		broadcaster.publish({name: "EntityCreated", entity: reusedEntity});

		return reusedEntity as any;
	}


	// Create new and add to the pool
	const newEntity = new Entity(label, disposeEntity);

	// Add the new entity to the pool
	entityPool.add(newEntity);

	// Execute init callback
	if (init) init(newEntity as any);

	// Notify a new Entity is Created
	broadcaster.publish({name: "EntityCreated", entity: newEntity});

	return newEntity as any;
}

function disposeEntity(entity: IEntity) {
	// Notify an Entity will be disposed
	broadcaster.publish({name: "EntityDispose", entity});

	// Remove all components (HACK: now done by removing all props)
	// Components could hold listen to dispose message and call EntityDispose
	// tslint:disable-next-line:forin
	for (const key in entity) { delete (entity as any)[key]; }

	// Free Entity in pool at dispose
	entityPool.free(entity);
}


export function cloneEntity<TEntityIn extends IMutableEntity, TEntityOut extends IEntity>(entity: TEntityIn, init: (entity: TEntityIn) => TEntityOut): TEntityOut {

	// Create/Recycle a new entity
	return createEntity(entity.label, (newEntity: any) => {

		// HACK: Because entity has only fields, we can all copy them
		for (const key in entity) {
			if (entity.hasOwnProperty(key)) {
				newEntity[key] = entity[key];
			}
		}

		// ID cannot be cloned, must be unique
		newEntity.id = Entity.createNewId();

		// Add extra initialization
		return init(newEntity) as any;
	});
}