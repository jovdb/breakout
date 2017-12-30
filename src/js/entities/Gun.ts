import { collideComponent } from "../components/CollideComponent";
import { gravityComponent } from "../components/GravityComponent";
import { positionComponent } from "../components/PositionComponent";
import { renderableComponent } from "../components/RenderComponent";
import { sizeComponent } from "../components/SizeComponent";
import { velocityComponent } from "../components/VelocityComponent";
import { createEntity } from "./Entity";

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
