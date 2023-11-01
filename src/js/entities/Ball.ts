import { collideComponent } from "../components/CollideComponent.js";
import { positionComponent } from "../components/PositionComponent.js";
import { renderableComponent } from "../components/RenderComponent.js";
import { sizeComponent } from "../components/SizeComponent.js";
import { velocityComponent } from "../components/VelocityComponent.js";
import { createEntity } from "./Entity.js";

declare global {
	interface IBall extends IMutableEntity<"Ball"> {}
}

export function createBall(centerX = 0, bottomY = 0, size = 5) {

	return createEntity("Ball", entity => {
		const e = entity.addComponents(positionComponent, renderableComponent, sizeComponent, velocityComponent, collideComponent);
		e.width = size;
		e.height = size;
		e.x = Math.round(centerX - e.width / 2);
		e.y = bottomY - e.height;
		e.collidesWith = ["World", "Palette", "Block"];
		return e;
	});
}

export function isBall(entity: IEntity): entity is IBall {
	return entity.label === "Ball";
}
