import { positionComponent } from "../components/PositionComponent.js";
import { renderableComponent } from "../components/RenderComponent.js";
import { createEntity } from "./Entity.js";
export function createText(centerX = 0, centerY = 0, text = "", fillColor = "#000") {
    return createEntity("Text", entity => {
        const e = entity.addComponents(positionComponent, renderableComponent);
        e.x = centerX;
        e.y = centerY;
        e.text = text;
        e.fillColor = fillColor;
        e.fontSize = 20;
        return e;
    });
}
export function isText(entity) {
    return entity.label === "Text";
}
//# sourceMappingURL=Text.js.map