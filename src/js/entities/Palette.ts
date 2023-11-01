import { collideComponent } from "../components/CollideComponent.js";
import { positionComponent } from "../components/PositionComponent.js";
import { renderableComponent } from "../components/RenderComponent.js";
import { sizeComponent } from "../components/SizeComponent.js";
import { velocityComponent } from "../components/VelocityComponent.js";
import { createEntity } from "./Entity.js";

declare global {
	interface IPalette extends IEntity<"Palette">, IPosition, IRenderable, ISize, IVelocity, ICollides {
		bullets: number;
	}
}

export function createPalette(world: Readonly<IWorld & ISize>): IPalette {
	return createEntity("Palette", entity => {

		const e: IPalette = entity.addComponents(positionComponent, renderableComponent, sizeComponent, velocityComponent, collideComponent) as any;
		e.width = 50;
		e.height = 14;
		e.x = Math.round(world.width / 2 - e.width / 2);
		e.y = world.height - 20;
		e.bullets = 0;
		e.collidesWith = "World";
		return e;
	});
}

export function isPalette(entity: IEntity): entity is IPalette {
	return entity.label === "Palette";
}

