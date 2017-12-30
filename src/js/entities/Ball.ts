import { collideComponent } from "../components/CollideComponent";
import { positionComponent } from "../components/PositionComponent";
import { renderableComponent } from "../components/RenderComponent";
import { sizeComponent } from "../components/SizeComponent";
import { velocityComponent } from "../components/VelocityComponent";
import { createEntity } from "./Entity";

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
