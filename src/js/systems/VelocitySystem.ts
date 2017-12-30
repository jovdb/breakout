import { entityPool } from "../classes/Pool";
import { gravityComponent } from "../components/GravityComponent";
import { positionComponent } from "../components/PositionComponent";
import { velocityComponent } from "../components/VelocityComponent";


/** Keeps entities moving */
export class VelocitySystem {

	public update() {

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