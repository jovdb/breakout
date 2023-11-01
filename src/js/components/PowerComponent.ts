import { IComponent } from "./IComponent.js";

declare global {
	interface IPower {
		hasPower: true;
	}
}

class PowerComponent implements IComponent<IPower> {

	public addTo<TEntity extends IMutableEntity>(entity: TEntity, x?: number, y?: number): TEntity & IPower;
	public addTo(entity: IPower): any {
		entity.hasPower = true;
		return entity;
	}

	public removeFrom(entity: IMutableEntity & IPower) {
		delete (entity as any).hasPower;
	}

	public isOn<TEntity extends IEntity>(entity: TEntity): entity is TEntity & IPower {
		return !!(entity as any).hasPower;
	}
}

/** Adds gravity to the entity: it will fall down */
export const powerComponent = new PowerComponent();