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


declare global {

	// Improve signature af function methods
	interface Function {

		/**
		 * Calls the function, substituting the specified object for the this value of the function, and the specified array for the arguments of the function.
		 * @param thisArg The object to be used as the this object.
		 * @param argArray A set of arguments to be passed to the function.
		 */
		apply<TResult>(this: (...args: any[]) => TResult, thisArg: any, argArray?: any): TResult;

		/**
			* Calls a method of an object, substituting another object for the current object.
			* @param thisArg The object to be used as the current object.
			* @param argArray A list of arguments to be passed to the method.
			*/
		call<TResult>(this: (...args: any[]) => TResult, thisArg: any, argArray?: any): TResult;

		/**
		 * For a given function, creates a bound function that has the same body as the original function.
		 * The this object of the bound function is associated with the specified object, and has the specified initial parameters.
		 * @param thisArg An object to which the this keyword can refer inside the new function.
		 * @param argArray A list of arguments to be passed to the new function.
		 */
		bind<TFn extends Function>(this: TFn, thisArg: any, ...argArray: any[]): TFn;
	}
}

class App {

	private renderSystem: RenderSystem;
	private gravitySystem: VelocitySystem;
	private cleanUpSystem: CleanUpSystem;
	private collisionSystem: CollisionSystem;
	private blockSystem: BlockSystem;
	private paletteSystem: PaletteSystem;
	private ballSystem: BallSystem;
	private gunSystem: GunSystem;

	private world: Readonly<IWorld & ISize>;
	private palette: Readonly<IPalette>;

	constructor() {

		this.world = createWorld(800, 400);
		this.palette = createPalette(this.world);

		// Set canvas size
		const gameEl = document.getElementById("game") as HTMLDivElement;
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

	private fillWorld() {

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
		ball.dx = 1 - Math.random() * 2 ; //angle

	}

	private start(): () => void {

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
	private renderLoop() {

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

export const app: {} = new App();
