import { IComponent } from "./IComponent";

declare global {

	interface ICollides {

		/** demping factor when bouncing 0 to 1: 1: No demping */
		bounceFactor: number;

		/** broadcast Collision event */
		collidesWith: string | string[] | ((entity: IWorld | (IEntity & IPosition & ISize)) => boolean);
	}
}

class CollideComponent implements IComponent<ICollides> {

	public addTo<TEntity extends IMutableEntity>(entity: TEntity, x?: number, y?: number): TEntity & ICollides;
	public addTo(entity: ICollides, bounceFactor = -1): any {
		entity.bounceFactor = bounceFactor;
		entity.collidesWith = "";
		return entity;
	}

	public removeFrom(entity: IMutableEntity & ICollides) {
		delete entity.bounceFactor;
		delete entity.collidesWith;
	}

	public isOn<TEntity extends IEntity>(entity: TEntity): entity is TEntity & ICollides {
		return "bounceFactor" in entity;
	}
}

/** This entity will bounce to other CollideComponents */
export const collideComponent = new CollideComponent();

