import { gravityComponent } from "../components/GravityComponent";
import { positionComponent } from "../components/PositionComponent";
import { renderableComponent } from "../components/RenderComponent";
import { sizeComponent } from "../components/SizeComponent";
import { velocityComponent } from "../components/VelocityComponent";
import { createEntity } from "./Entity";

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