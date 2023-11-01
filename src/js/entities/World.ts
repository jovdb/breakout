import { renderableComponent } from "../components/RenderComponent.js";
import { sizeComponent } from "../components/SizeComponent.js";
import { createEntity } from "./Entity.js";

declare global {
	interface IWorld extends IEntity<"World">, ISize, IRenderable {}
}

export function createWorld(width = 300, height = 300): IWorld {
	return createEntity("World", entity => {
		return renderableComponent.addTo((sizeComponent.addTo(entity, width, height)));
	});

}

export function isWorld(entity: IEntity): entity is IWorld {
	return entity.label === "World";
}