import { positionComponent } from "../components/PositionComponent.js";
import { renderableComponent } from "../components/RenderComponent.js";
import { createEntity } from "./Entity.js";

declare global {
	interface IText extends IEntity<"Text">, IPosition, IRenderable {
		text: string;
		fillColor: string;
		fontSize: number;
	}
}

export function createText(centerX = 0, centerY = 0, text = "", fillColor = "#000"): IText {

	return createEntity("Text", entity => {
		const e: IText = entity.addComponents(positionComponent, renderableComponent) as any;
		e.x = centerX;
		e.y = centerY;
		e.text = text;
		e.fillColor = fillColor;
		e.fontSize = 20;
		return e;
	});
}

export function isText(entity: IEntity): entity is IText {
	return entity.label === "Text";
}