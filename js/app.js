/*
Remark:
I used a bundler from the start, but because I don't need any 3th Party libraries,
I could just use Typescript references without bundling
*/
import { level } from "./classes/Level.js";
import "./components/IComponent.js";
// Entities
import { createBall } from "./entities/Ball.js";
import { createBlock } from "./entities/Block.js";
import { createPalette } from "./entities/Palette.js";
import { createWorld } from "./entities/World.js";
// Systems
import { BallSystem } from "./systems/BallSystem.js";
import { BlockSystem } from "./systems/BlockSystem.js";
import { CleanUpSystem } from "./systems/CleanUpSystem.js";
import { CollisionSystem } from "./systems/CollisionSystem.js";
import { GunSystem } from "./systems/GunSystem.js";
import { PaletteSystem } from "./systems/PaletteSystem.js";
import { RenderSystem } from "./systems/RenderSystem.js";
import { VelocitySystem } from "./systems/VelocitySystem.js";
class App {
    renderSystem;
    gravitySystem;
    cleanUpSystem;
    collisionSystem;
    blockSystem;
    paletteSystem;
    ballSystem;
    gunSystem;
    world;
    palette;
    constructor() {
        this.world = createWorld(800, 400);
        this.palette = createPalette(this.world);
        // Set canvas size
        const gameEl = document.getElementById("game");
        gameEl.style.width = `${this.world.width}px`;
        gameEl.style.height = `${this.world.height}px`;
        this.renderSystem = new RenderSystem(gameEl, this.world);
        this.gravitySystem = new VelocitySystem();
        this.cleanUpSystem = new CleanUpSystem(this.world);
        this.collisionSystem = new CollisionSystem(this.world);
        this.blockSystem = new BlockSystem();
        this.paletteSystem = new PaletteSystem();
        this.ballSystem = new BallSystem();
        this.gunSystem = new GunSystem();
        this.renderLoop = this.renderLoop.bind(this);
        this.start();
    }
    fillWorld() {
        // Build Level
        const blockWidth = this.world.width / level.columnCount;
        const blockHeight = (this.world.height - 50) / level.rowCount;
        const blockStartX = 0;
        const blockStartY = 0;
        for (const blockConfig of level.blocks) {
            const entity = createBlock(blockStartX + blockConfig.col * blockWidth, blockStartY + blockConfig.row * blockHeight, blockWidth, blockHeight, blockConfig.color, blockConfig.strength || 1);
            entity.effect = blockConfig.effect;
        }
        const ball = createBall(this.palette.x + this.palette.width / 2, this.palette.y);
        ball.dy = -level.startBallVelocity;
        ball.dx = 1 - Math.random() * 2; //angle
    }
    start() {
        const unsubscribes = [
            this.paletteSystem.start(),
            this.blockSystem.start(),
            this.gunSystem.start(),
            this.renderSystem.start()
        ];
        this.fillWorld();
        // animation loop
        this.renderLoop();
        return () => {
            unsubscribes
                .reverse()
                .forEach(unsubscribe => {
                unsubscribe();
            });
        };
    }
    // animation loop
    renderLoop() {
        this.paletteSystem.update(this.palette);
        this.gravitySystem.update();
        this.collisionSystem.update();
        this.ballSystem.update(level);
        this.renderSystem.renderAnimationFrame();
        this.cleanUpSystem.cleanUp();
        // Next frame
        requestAnimationFrame(this.renderLoop);
    }
}
export const app = new App();
//# sourceMappingURL=app.js.map