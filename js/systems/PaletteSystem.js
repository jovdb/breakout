import { broadcaster } from "../classes/Broadcaster.js";
import { gravityComponent } from "../components/GravityComponent.js";
import { velocityComponent } from "../components/VelocityComponent.js";
import { isBall } from "../entities/Ball.js";
import { isPalette } from "../entities/Palette.js";
/** Cleanup items that go off-screen */
export class PaletteSystem {
    maxHorizontalBallVelocity;
    direction;
    acceleration;
    deceleration;
    maxSpeed;
    constructor() {
        this.direction = "";
        this.acceleration = 0.2;
        this.deceleration = 0.7;
        this.maxSpeed = 6;
        this.maxHorizontalBallVelocity = 3;
    }
    start() {
        const handleKeyDown = (e) => {
            if (e.which === 37)
                this.direction = "left";
            else if (e.which === 39)
                this.direction = "right";
        };
        const handleKeyUp = (e) => {
            if (e.which === 37 && this.direction === "left")
                this.direction = "";
            if (e.which === 39 && this.direction === "right")
                this.direction = "";
        };
        // TODO: also support mouse?
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
        // Listen to collision messages
        const broadcasterUnsubscribe = broadcaster.subscribeOnMessage("Collision", message => {
            // Make a normal ball when falls from block
            if (isBall(message.entity) &&
                message.entity.hasComponents(velocityComponent)) {
                // On collision, remove gravity from ball
                if (message.entity.hasComponents(gravityComponent))
                    message.entity.removeComponents(gravityComponent);
                // Ball falls on top of palette?
                if (isPalette(message.collidedWith) &&
                    message.side === "top") {
                    this.entityToPalletCollision(message.collidedWith, message.entity);
                }
            }
        });
        // Unsubscribe
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
            broadcasterUnsubscribe();
        };
    }
    update(palette) {
        if (this.direction === "") {
            if (palette.dx < 0.1 && palette.dx > -0.1) {
                palette.dx = 0;
            }
            else {
                palette.dx *= this.deceleration;
            }
        }
        else if (this.direction === "left") {
            palette.dx = Math.max(palette.dx - this.acceleration, -this.maxSpeed);
        }
        else if (this.direction === "right") {
            palette.dx = Math.min(palette.dx + this.acceleration, this.maxSpeed);
        }
    }
    entityToPalletCollision(palette, entity) {
        // Add effect, hitting on the left side steers the ball more to the left
        // (-1 <> 1)
        const paletteStartX = palette.x - entity.width;
        const paletteEndX = palette.x + palette.width;
        const entityX = entity.x;
        const ratio = (entityX - paletteStartX) / (paletteEndX - paletteStartX);
        entity.dx += ratio * 2 - 1;
        // Add some of the velocity of the palette to the ball
        entity.dx += palette.dx * 0.3;
        // Add some randomness so never locked
        entity.dx += Math.random() * 0.1 + 0.05;
        // Limit speed
        if (entity.dx > this.maxHorizontalBallVelocity)
            entity.dx = this.maxHorizontalBallVelocity;
        if (entity.dx < -this.maxHorizontalBallVelocity)
            entity.dx = -this.maxHorizontalBallVelocity;
    }
}
//# sourceMappingURL=PaletteSystem.js.map