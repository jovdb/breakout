import { collideComponent } from "../components/CollideComponent.js";
import { positionComponent } from "../components/PositionComponent.js";
import { renderableComponent } from "../components/RenderComponent.js";
import { sizeComponent } from "../components/SizeComponent.js";
import { velocityComponent } from "../components/VelocityComponent.js";
import { createEntity } from "./Entity.js";
export function createBullet(centerX = 0, bottomY = 0) {
    return createEntity("Bullet", entity => {
        const e = entity.addComponents(positionComponent, sizeComponent, renderableComponent, velocityComponent, collideComponent);
        e.width = 3;
        e.height = 8;
        e.x = centerX - 1;
        e.y = bottomY;
        e.dy = -4;
        e.collidesWith = "Block";
        return e;
    });
}
export function isBullet(entity) {
    return entity.label === "Bullet";
}
//# sourceMappingURL=Bullet.js.map