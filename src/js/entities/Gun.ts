import { collideComponent } from "../components/CollideComponent.js";
import { gravityComponent } from "../components/GravityComponent.js";
import { positionComponent } from "../components/PositionComponent.js";
import { renderableComponent } from "../components/RenderComponent.js";
import { sizeComponent } from "../components/SizeComponent.js";
import { velocityComponent } from "../components/VelocityComponent.js";
import { createEntity } from "./Entity.js";

declare global {
	interface IGun extends IEntity<"Gun">, IPosition, ISize, IRenderable, IGravity, IVelocity, ICollides {}
}

export function createGun(centerX = 0, centerY = 0): IGun {

	return createEntity("Gun", entity => {
		const e = entity.addComponents(positionComponent, sizeComponent, renderableComponent, gravityComponent, velocityComponent, collideComponent);
		e.width = 5;
		e.height = 5;
		e.x = centerX - e.width / 2;
		e.y = centerY - e.width / 2;
		e.collidesWith = "Palette";
		return e;
	});
}

export function isGun(entity: IEntity): entity is IGun {
	return entity.label === "Gun";
}
