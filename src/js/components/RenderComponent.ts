import { IComponent } from "./IComponent.js";

declare global {
	interface IRenderable {
		canRender: true;
	}
}

class RendarableComponent implements IComponent<IRenderable> {

	public addTo<TEntity extends IMutableEntity>(entity: TEntity): TEntity & IRenderable;
	public addTo(entity: IRenderable): any {
		entity.canRender = true;
		return entity;
	}

	public removeFrom(entity: IMutableEntity & IRenderable) {
		delete (entity as any).canRender;
	}

	public isOn<TEntity extends IEntity>(entity: TEntity): entity is TEntity & IRenderable {
		return !!(entity as any as IRenderable).canRender;
	}
}

/** Indicates that this entity can be rendered */
export const renderableComponent = new RendarableComponent();
