import { IComponent } from "./IComponent.js";

declare global {
	interface IPosition {
		/** X position */
		x: number;

		/** Y position */
		y: number;
	}
}

class PositionComponent implements IComponent<IPosition> {

	public addTo<TEntity extends IMutableEntity>(entity: TEntity, x?: number, y?: number): TEntity & IPosition;
	public addTo(entity: IPosition, x = 0, y = 0): any {
		entity.x = x;
		entity.y = y;
		return entity;
	}

	public removeFrom(entity: IMutableEntity & IPosition) {
		delete (entity as any).x;
		delete (entity as any).y;
	}

	public isOn<TEntity extends IEntity>(entity: TEntity): entity is TEntity & IPosition {
		return "x" in entity;
	}
}

/** Adds a position (x, y) to the entity */
export const positionComponent = new PositionComponent();

