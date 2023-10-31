import { IComponent } from "./IComponent";

declare global {
	interface ISize {

		/** Width of the entity */
		width: number;

		/** Height of the entity */
		height: number;
	}
}

class SizeComponent implements IComponent<ISize> {

	public addTo<TEntity extends IMutableEntity>(entity: TEntity, width?: number, height?: number): TEntity & ISize;
	public addTo(entity: ISize, width = 100, height = 100): any {
		entity.width = width;
		entity.height = height;
		return entity;
	}

	public removeFrom(entity: IMutableEntity & ISize) {
		delete entity.width;
		delete entity.height;
	}

	public isOn<TEntity extends IEntity>(entity: TEntity): entity is TEntity & ISize {
		return "width" in entity;
	}
}

/** Adds a size (width, height) to the entity */
export const sizeComponent = new SizeComponent();

