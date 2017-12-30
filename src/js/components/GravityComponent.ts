declare global {
	interface IGravity {
		gravityY: number;
	}
}

class GravityComponent implements IComponent<IGravity> {

	public addTo<TEntity extends IMutableEntity>(entity: TEntity, x?: number, y?: number): TEntity & IGravity;
	public addTo(entity: IGravity): any {
		entity.gravityY = 0.05;
		return entity;
	}

	public removeFrom(entity: IMutableEntity & IGravity) {
		delete entity.gravityY;
	}

	public isOn<TEntity extends IEntity>(entity: TEntity): entity is TEntity & IGravity {
		return "gravityY" in entity;
	}
}

/** Adds gravity to the entity: it will fall down */
export const gravityComponent = new GravityComponent();