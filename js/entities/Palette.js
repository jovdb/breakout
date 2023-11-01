import { collideComponent } from "../components/CollideComponent.js";
import { positionComponent } from "../components/PositionComponent.js";
import { renderableComponent } from "../components/RenderComponent.js";
import { sizeComponent } from "../components/SizeComponent.js";
import { velocityComponent } from "../components/VelocityComponent.js";
import { createEntity } from "./Entity.js";
export function createPalette(world) {
    return createEntity("Palette", entity => {
        const e = entity.addComponents(positionComponent, renderableComponent, sizeComponent, velocityComponent, collideComponent);
        e.width = 50;
        e.height = 14;
        e.x = Math.round(world.width / 2 - e.width / 2);
        e.y = world.height - 20;
        e.bullets = 0;
        e.collidesWith = "World";
        return e;
    });
}
export function isPalette(entity) {
    return entity.label === "Palette";
}
//# sourceMappingURL=Palette.js.map