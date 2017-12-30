declare global {
	interface IVelocity {

		/** Delta of horizontal position */
		dx: number;

		/** Delta of vertical position */
		dy: number;
	}
}

class VelocityComponent implements IComponent<IVelocity> {

	public addTo<TEntity extends IMutableEntity>(entity: TEntity, dx?: number, dy?: number): TEntity & IVelocity;
	public addTo(entity: IVelocity, dx = 0, dy = 0): any {
		entity.dx = dx;
		entity.dy = dy;
		return entity;
	}

	public removeFrom(entity: IMutableEntity & IVelocity) {
		delete entity.dx;
		delete entity.dy;
	}

	public isOn<TEntity extends IEntity>(entity: TEntity): entity is TEntity & IVelocity {
		return "dx" in entity;
	}
}

/** Allows movement of this entity */
export const velocityComponent = new VelocityComponent();