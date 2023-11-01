import { entityPool } from "../classes/Pool.js";
import { gravityComponent } from "../components/GravityComponent.js";
import { positionComponent } from "../components/PositionComponent.js";
import { velocityComponent } from "../components/VelocityComponent.js";
/** Keeps entities moving */
export class VelocitySystem {
    update() {
        entityPool
            .filterComponents(positionComponent, velocityComponent)
            .forEach(entity => {
            // Add Gravity
            if (entity.hasComponents(gravityComponent)) {
                entity.dy += entity.gravityY;
            }
            entity.y += entity.dy;
            entity.x += entity.dx;
        });
    }
}
//# sourceMappingURL=VelocitySystem.js.map