import { collideComponent } from "../components/CollideComponent.js";
import { positionComponent } from "../components/PositionComponent.js";
import { renderableComponent } from "../components/RenderComponent.js";
import { sizeComponent } from "../components/SizeComponent.js";
import { createEntity } from "./Entity.js";

declare global {
	type BlockEffect = "extraBall" | "gun" | "powerball";

	interface IBlock extends IEntity<"Block">, IPosition, ISize, IRenderable, ICollides {
		fillColor: string;
		strength: number;
		effect?: BlockEffect;
	}
}

export function createBlock(x = 0, y = 0, width = 100, height = 50, color = "#f00", strength = 1): IBlock {
	return createEntity("Block", entity => {

		const e: IBlock = entity.addComponents(positionComponent, sizeComponent, renderableComponent, collideComponent) as any;
		e.x = x;
		e.y = y;
		e.width = width;
		e.height = height;
		e.fillColor = color;
		e.strength = strength;
		return e;
	});
}

export function isBlock(entity: IEntity): entity is IBlock {
	return entity.label === "Block";
}
