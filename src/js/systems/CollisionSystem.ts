import { broadcaster } from "../classes/Broadcaster";
import { entityPool } from "../classes/Pool";
import { collideComponent } from "../components/CollideComponent";
import { positionComponent } from "../components/PositionComponent";
import { powerComponent } from "../components/PowerComponent";
import { sizeComponent } from "../components/SizeComponent";
import { velocityComponent } from "../components/VelocityComponent";
import { isBall } from "../entities/Ball";
import { isBlock } from "../entities/Block";
import { isPalette } from "../entities/Palette";
import { isWorld } from "../entities/World";
import { exhaustiveFail } from "../utils";


declare global {

	type CollisionSide = "top" | "left" | "bottom" | "right";

	// Add Messages
	interface MessageMap extends MessageMapValidator<keyof MessageMap> {
		"Collision": { name: "Collision"; entity: IEntity & IPosition & ISize; collidedWith: IEntity; side: CollisionSide; collisionVelocityX: number; collisionVelocityY: number };
	}
}


/** Entities that can fall down */
export class CollisionSystem {

	private world: Readonly<IWorld & ISize>;

	constructor(world: Readonly<IWorld & ISize>) {
		this.world = world;
	}

	private getBounceFactor(entity: IEntity, obstacle: IWorld | (IEntity & ICollides), _side: CollisionSide) {

		// Pallets Bounce to something else as a ball
		if (isPalette(entity) && !isBall(obstacle)) return -0.4;

		// World is currently not a collision, because bouncing needs to bounce on the inside
		if (isWorld(obstacle)) return -1;

		// Balls don't bounce to balls
		if (isBall(entity) && isBall(obstacle)) return 1;

		// Is PowerBall, Go through
		if (isBall(entity) && isBlock(obstacle) && entity.hasComponents(powerComponent)) return 1;

		return obstacle.bounceFactor;
	}

	private afterCollision(entity: IEntity & IPosition & ISize, obstacle: IWorld | (IEntity & ICollides), side: CollisionSide, collisionVelocityX: number, collisionVelocityY: number): void {

		//console.log(`CollisionSystem: '${entity.label}#${entity.id}' collided at the '${side}' of '${obstacle.label}#${obstacle.id}'`);

		broadcaster.publish({
			name: "Collision",
			entity,
			collidedWith: obstacle,
			side,
			collisionVelocityX,
			collisionVelocityY
		});
	}

	/** I create a basic collider detection */
	private rectToRectColission(source: IEntity & IPosition & ISize & IVelocity, obstacle: IEntity & IPosition & ISize & ICollides) {

		const prevX = source.x - source.dx;
		const prevY = source.y - source.dy;
		let hadCollision = false;

		if (
			// Horizontal range
			source.x + source.width > obstacle.x &&
			source.x < obstacle.x + obstacle.width
		) {

			// Top Bounce
			if (
				source.y + source.height >= obstacle.y &&
				prevY + source.height < obstacle.y &&
				source.dy > 0 // Comming from above ?
			) {
				const collisionVelocityY = source.dy;
				const bounce = this.getBounceFactor(source, obstacle, "top");
				source.dy *= bounce;
				source.y += (source.y + source.height - obstacle.y) * bounce;
				this.afterCollision(source, obstacle, "top", source.dx, collisionVelocityY);
				hadCollision = true;
			}

			// Bottom Bounce
			else if (
				source.y <= obstacle.y + obstacle.height &&
				prevY > obstacle.y + obstacle.height &&
				source.dy < 0 // Comming from below ?
			) {
				const collisionVelocityY = source.dy;
				const bounce = this.getBounceFactor(source, obstacle, "bottom");
				source.dy *= bounce;
				source.y -= (obstacle.y + obstacle.height - source.y) * bounce;
				this.afterCollision(source, obstacle, "bottom", source.dx, collisionVelocityY);
				hadCollision = true;
			}
		}

		if (
			// Vertical range
			source.y + source.height > obstacle.y &&
			source.y < obstacle.y + obstacle.height
		) {

			// Left Bounce
			if (
				source.x + source.width >= obstacle.x &&
				prevX + source.width < obstacle.x &&
				source.dx > 0 // Comming from left ?
			) {
				const collisionVelocityX = source.dx;
				const bounce = this.getBounceFactor(source, obstacle, "left");
				source.dx *= bounce;
				source.x += (source.x + source.width - obstacle.x) * bounce;
				this.afterCollision(source, obstacle, "left", collisionVelocityX, source.dy);
				hadCollision = true;
			}

			// Right Bounce
			else if (
				source.x <= obstacle.x + obstacle.width &&
				prevX > obstacle.x + obstacle.width &&
				source.dx < 0 // comming from right ?
			) {
				const collisionVelocityX = source.dx;
				const bounce = this.getBounceFactor(source, obstacle, "right");
				source.dx *= bounce;
				source.x -= (obstacle.x + obstacle.width - source.x) * bounce;
				this.afterCollision(source, obstacle, "right", collisionVelocityX, source.dy);
				hadCollision = true;
			}
		}

		return hadCollision;
	}

	private worldCollision(entity: IEntity & IPosition & ISize & IVelocity) {

		// Top Side
		if (entity.y < 0) {
			const collisionVelocityY = entity.dy;
			const bounce = this.getBounceFactor(entity, this.world, "top");
			entity.dy *= bounce;
			entity.y += entity.y * bounce;
			this.afterCollision(entity, this.world, "top", entity.dx, collisionVelocityY);
		}

		// Left Side
		if (entity.x < 0) {
			const collisionVelocityX = entity.dx;
			const bounce = this.getBounceFactor(entity, this.world, "left");
			entity.dx *= bounce;
			entity.x += entity.x * bounce;
			this.afterCollision(entity, this.world, "left", collisionVelocityX, entity.dy);
		}

		// right side
		else if (entity.x + entity.width > this.world.width) {
			const collisionVelocityX = entity.dx;
			const bounce = this.getBounceFactor(entity, this.world, "right");
			entity.dx *= bounce;
			entity.x += (entity.x + entity.width - this.world.width) * bounce;
			this.afterCollision(entity, this.world, "right", collisionVelocityX, entity.dy);
		}
	}

	public update() {

		const obstacles = entityPool.filterComponents(positionComponent, sizeComponent, collideComponent);
		const moveableEntities = entityPool.filterComponents(positionComponent, sizeComponent, velocityComponent, collideComponent);

		// Validate movable entities
		for (const entity of moveableEntities) {

			// Game border
			if (this.canCollide(entity.collidesWith, this.world)) this.worldCollision(entity);

			for (const obstacle of obstacles) {
				if (obstacle !== entity) {
					if (this.canCollide(entity.collidesWith, obstacle)) {
						if (this.rectToRectColission(entity, obstacle)) {
							break; // we don't collide with 2 objects
						}
					}
				}
			}
		}
	}

	private canCollide(collidesWith: ICollides["collidesWith"], targetEntity: IWorld | (IEntity & IPosition & ISize)) {

		if (typeof collidesWith === "string") {
			return collidesWith === targetEntity.label;
		}

		else if (Array.isArray(collidesWith)) {
			return collidesWith.some(label => label === targetEntity.label);
		}

		else if (typeof collidesWith === "function") {
			return collidesWith(targetEntity);
		}

		else {
			exhaustiveFail(collidesWith);
		}

		return false;
	}
}