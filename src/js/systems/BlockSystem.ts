import { broadcaster } from "../classes/Broadcaster.js";
import { entityPool } from "../classes/Pool.js";
import { gravityComponent } from "../components/GravityComponent.js";
import { powerComponent } from "../components/PowerComponent.js";
import { createBall, isBall } from "../entities/Ball.js";
import { isBlock } from "../entities/Block.js";
import { isBullet } from "../entities/Bullet.js";
import { createGun } from "../entities/Gun.js";
import { createParticle } from "../entities/Particle.js";
import { createText } from "../entities/Text.js";
import { isWorld } from "../entities/World.js";
import { exhaustiveFail } from "../utils.js";
import { ballSize, powerBallSize } from "./RenderSystem.js";

/** Cleanup items that go off-screen */
export class BlockSystem {

	public start(): () => void {

		// Listen to collision messages
		return broadcaster.subscribeOnMessage("Collision", (message, afterMessageHandling) => {

			let wasBlockHit = false;

			// Block hit by ball?
			if (
				isBall(message.entity) &&
				isBlock(message.collidedWith)
			) {
				this.blockHit(message.collidedWith, message);
				wasBlockHit = true;
			}

			// Block hit by bullet?
			else if (
				isBullet(message.entity) &&
				isBlock(message.collidedWith)
			) {
				this.blockHit(message.collidedWith, message);

				// If we dispose entity here, next handlers get a disposed entity and cannot handle message properly
				afterMessageHandling(message => {
					message.entity.dispose();
				});

				wasBlockHit = true;
			}

			if (wasBlockHit) {
				// End of level?
				const isLastBlock = !entityPool.all().some(isBlock);
				if (isLastBlock) {
					const world = entityPool.first(isWorld);
					if (world) {
						createText(world.width / 2, world.height / 2, "Level completed\nPress F5 to play again", "#000");
					}
				}
			}
		});
	}

	public blockHit(block: IBlock, message: MessageMap["Collision"]) {

		block.strength--;

		// Remove block
		if (block.strength <= 0) {

			if (!block.effect) {
				// Do nothing
			}

			// Split ball when block is removed
			else if (block.effect === "extraBall") {
				const ball = createBall(block.x + block.width / 2, block.y + block.height / 2, ballSize);
				ball.addComponents(gravityComponent);

			// Gun
			} else if (block.effect === "gun") {
				createGun(block.x + block.width / 2, block.y + block.height / 2 + 2);

			// PowerBall
			} else if (block.effect === "powerball") {
				const ball = createBall(block.x + block.width / 2, block.y + block.height / 2, powerBallSize);
				ball.addComponents(gravityComponent);
				ball.addComponents(powerComponent);
			} else {
				exhaustiveFail(block.effect);
			}

			// Add particle effect
			const partsX = Math.min(Math.floor(block.width / 2), 25);
			const partsY = Math.min(Math.floor(block.height / 2), 25);

			const particleDX = message.collisionVelocityX * 0.5;
			const particleDY = message.collisionVelocityY * 0.5;
			const randomness = 0.8;

			for (let x = 0; x < partsX; x++) {
				for (let y = 0; y < partsY; y++) {
					const particleWidth = block.width / partsX;
					const particleHeight = block.height / partsY;
					const color = block.fillColor;
					const particle = createParticle(block.x, block.y, particleWidth, particleHeight, color);
					particle.x += particleWidth * x;
					particle.y += particleHeight * y;
					particle.dx = particleDX + randomness / 2 - Math.random() * randomness;
					particle.dy = particleDY + randomness / 2 - Math.random() * randomness;
				}
			}

			block.dispose();

		}
	}
}

