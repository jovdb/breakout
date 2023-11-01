import { collideComponent } from "../components/CollideComponent.js";
import { positionComponent } from "../components/PositionComponent.js";
import { renderableComponent } from "../components/RenderComponent.js";
import { sizeComponent } from "../components/SizeComponent.js";
import { createEntity } from "./Entity.js";
export function createBlock(x = 0, y = 0, width = 100, height = 50, color = "#f00", strength = 1) {
    return createEntity("Block", entity => {
        const e = entity.addComponents(positionComponent, sizeComponent, renderableComponent, collideComponent);
        e.x = x;
        e.y = y;
        e.width = width;
        e.height = height;
        e.fillColor = color;
        e.strength = strength;
        return e;
    });
}
export function isBlock(entity) {
    return entity.label === "Block";
}
//# sourceMappingURL=Block.js.map