import { entityPool } from "../classes/Pool";
import { positionComponent } from "../components/PositionComponent";
import { velocityComponent } from "../components/VelocityComponent";
import { isBall } from "../entities/Ball";

/** Cleanup items that go off-screen */
export class BallSystem {

	// Update on RAF
	public update(level: ILevel) {

		// Get Balls
		entityPool.all().filter(isBall).forEach(ball => {

			/** Increase ball speed during the game */
			if (ball.hasComponents(positionComponent, velocityComponent)) {

				// When to slow, increase to minimum speed (after gravity)
				if (ball.dy < level.startBallVelocity) {
					ball.dy *= 1.01;
				}

				// Increase speed with a limit
				else if (ball.dy < level.maxBallVelocity) {
					ball.dy *= level.ballVelocityAcceleration;
				} else {
					ball.dy = level.maxBallVelocity;
				}

			}
		});
	}

}
