import { level } from "../classes/Level";
import { entityPool } from "../classes/Pool";
import { collideComponent } from "../components/CollideComponent";
import { gravityComponent } from "../components/GravityComponent";
import { positionComponent } from "../components/PositionComponent";
import { sizeComponent } from "../components/SizeComponent";
import { createBall, isBall } from "../entities/Ball";
import { isBlock } from "../entities/Block";
import { isPalette } from "../entities/Palette";

/** Cleanup items that go off-screen */
export class CleanUpSystem {

	private world: Readonly<IWorld & ISize>;

	constructor(world: Readonly<IWorld & ISize>) {
		this.world = world;
	}

	public cleanUp() {

		// Level completed?
		const hasBlocks = entityPool.all().some(isBlock);

		entityPool
			.filterComponents(positionComponent) // All items that can move off-screen
			.forEach(entity => {

				// Get right position
				let rightX = entity.x;
				if (sizeComponent.isOn(entity)) {
					rightX += entity.width;
				}

				// Offscreen ? (We don't check top, so particles that don't collide come back down)
				if (
					rightX < 0 ||
					entity.x > this.world.width ||
					entity.y > this.world.height
				) {

					// Dispose entity
					entity.dispose();

					// Don't respawn at end of level
					if (hasBlocks) {

						const isLastBall = !entityPool.all().some(isBall);
						if (isLastBall) {

							// Respawn ball
							const palette = entityPool.first(isPalette);
							if (!palette) {
								console.error("Pallet not found to respaw ball");
							} else {
								const ball = createBall();
								ball.dy = -level.startBallVelocity;
								ball.dx = Math.random() * -0.4 + 0.2;
								ball.x = palette.x + palette.width / 2 - ball.width / 2;
								ball.y = palette.y - ball.height + 1;
							}
						}

					}
				}
			});


		// At end of level: Let ball fall down
		if (!hasBlocks) {
			entityPool.all().filter(isBall).forEach(ball => {
				ball.removeComponents(collideComponent);
				ball.addComponents(gravityComponent);
			});
		}

	}
}
