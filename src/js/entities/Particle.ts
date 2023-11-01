import { gravityComponent } from "../components/GravityComponent.js";
import { positionComponent } from "../components/PositionComponent.js";
import { renderableComponent } from "../components/RenderComponent.js";
import { sizeComponent } from "../components/SizeComponent.js";
import { velocityComponent } from "../components/VelocityComponent.js";
import { createEntity } from "./Entity.js";

declare global {
	interface IParticle extends IEntity<"Particle">, IPosition, ISize, IRenderable, IGravity, IVelocity {
		fillColor: string;
	}
}

export function createParticle(x = 0, y = 0, width = 3, height = 3, color = "#888"): IParticle {
	return createEntity("Particle", entity => {
		const e: IParticle = entity.addComponents(positionComponent, sizeComponent, renderableComponent, gravityComponent, velocityComponent) as any;
		e.x = x;
		e.y = y;
		e.width = width;
		e.height = height;
		e.fillColor = color;
		return e;
	});
}

export function isParticle(entity: IEntity): entity is IParticle {
	return entity.label === "Particle";
}