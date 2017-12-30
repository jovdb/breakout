import { broadcaster } from "../classes/Broadcaster";
import { createCache } from "../classes/cache";
import { entityPool } from "../classes/Pool";
import { positionComponent } from "../components/PositionComponent";
import { powerComponent } from "../components/PowerComponent";
import { renderableComponent } from "../components/RenderComponent";
import { sizeComponent } from "../components/SizeComponent";
import { velocityComponent } from "../components/VelocityComponent";
import { isBall } from "../entities/Ball";
import { isBlock } from "../entities/Block";
import { isBullet } from "../entities/Bullet";
import { isEntity } from "../entities/Entity";
import { isGun } from "../entities/Gun";
import { isPalette } from "../entities/Palette";
import { isParticle } from "../entities/Particle";
import { isText } from "../entities/Text";
import { isWorld } from "../entities/World";
import { exhaustiveFail } from "../utils";

/**
 * Draw items to screen
 * To slightly improve rendring, I used 2 canvases on top of each other:
 * - animationFrame: updates at each animation frame
 * - back: updates when a message broadcasted
 */

interface IBlockMetaData {crackLines: [number, number, number, number][]; }
interface IPowerBallMetaData {cycle: number; }
interface IMetaData {
	[id: string]: IBlockMetaData | IPowerBallMetaData;
}

export const ballSize = 5;
export const powerBallSize = 6;
export class RenderSystem {

	/** Context that will be updated each animation frame */
	private readonly animationFrameContext: CanvasRenderingContext2D;

	/** Context that will be updated at request */
	private readonly backContext: CanvasRenderingContext2D;

	private readonly world: Readonly<IWorld & ISize>;

	/** To prevent multiple sync rerenders, I wait until next tick to render */
	private isBackRerenderRequested: boolean;

	public showLabels: boolean;
	public getCachedOverlay: ((size: ISize) => HTMLCanvasElement) & ICache;

	/** Render related metadata not stored in entity, depends on render implementation */
	private metadata: IMetaData;

	constructor(gameEl: HTMLDivElement, world: Readonly<IWorld & ISize>) {
		this.showLabels = false;
		this.world = world;
		this.isBackRerenderRequested = false;
		this.metadata = {};

		gameEl.style.position = "relative"; // make Offset parent

		const backCanvas = document.createElement("canvas");
		backCanvas.style.position = "absolute";
		backCanvas.style.top = "0";
		backCanvas.style.left = "0";
		backCanvas.width = world.width;
		backCanvas.height = world.height;
		this.backContext = backCanvas.getContext("2d")!;
		gameEl.appendChild(backCanvas);

		const rafCanvas = document.createElement("canvas");
		rafCanvas.style.position = "absolute";
		rafCanvas.style.top = "0";
		rafCanvas.style.left = "0";
		rafCanvas.width = world.width;
		rafCanvas.height = world.height;
		this.animationFrameContext = rafCanvas.getContext("2d")!;
		gameEl.appendChild(rafCanvas);

		this.getCachedOverlay = createCache<ISize, HTMLCanvasElement>(
			RenderSystem.createBlockOverlay,
			size => `${size.width}x${size.height}`
		);

	}

	public start(): () => void {

		// Now I update on each message, not on each animationFrame
		// This can be more finetuned if needed
		return broadcaster.subscribe(message => {

			// Ignore creation or delete message of items with velocity (particles)
			if (!message.entity.hasComponents(velocityComponent)) {
				this.renderBack();
			}

			// If block weakend, get Break effect and store it
			if (
				message.name === "Collision" &&
				isBlock(message.collidedWith) &&
				message.collidedWith.strength > 0
			) {
				const block = message.collidedWith;
				const lines = this.getCrackLines(block, message.entity);

				const entityMetaData = this.metadata[block.id];
				if  (this.isBlockMetaData(entityMetaData)) {
					// Update
					entityMetaData.crackLines.push(...lines);
				} else {
					// Create
					this.metadata[block.id] = {
						crackLines: lines
					};
				}
				this.renderBack();
			}

			// Cleanup removed blockes
			else if (message.name === "EntityDispose") {
				delete this.metadata[message.entity.id];
			}

		});
	}

	private render(ctx: CanvasRenderingContext2D, entity: IEntity & IRenderable) {

		if (isBlock(entity)) {
			this.drawBlock(ctx, entity);
		}

		else if (isPalette(entity)) {
			this.drawPalette(ctx, entity);
		}

		else if (isBall(entity)) {
			if (entity.hasComponents(positionComponent, sizeComponent)) {
				if (entity.hasComponents(powerComponent)) {
					this.drawPowerBall(ctx, entity);
				} else {
					this.drawBall(ctx, entity);
				}
			}
		}

		else if (isWorld(entity)) {
			this.drawWorld(ctx, entity);
		}

		else if (isGun(entity)) {
			this.drawGun(ctx, entity.x + entity.width / 2, entity.y + entity.height / 2);
		}

		else if (isBullet(entity)) {
			this.drawBullet(ctx, entity);
		}

		else if (isParticle(entity)) {
			this.drawParticle(ctx, entity);
		}

		else if (isText(entity)) {
			this.drawText(ctx, entity);
		}

		// Default
		else if (entity.hasComponents(positionComponent)) {

			console.log(`RenderSystem: Could not render: ${entity.label}#${entity.id}`);
			if (entity.hasComponents(sizeComponent)) {
				const fillColor = "#aaa";
				this.drawRect(ctx, entity, fillColor);
				this.drawEntityLabel(ctx, entity); // Because this should
			} else {
				this.drawEntityLabel(ctx, entity); // Because this should
			}
		}

		// Debug
		if (this.showLabels && entity.hasComponents(positionComponent)) {
			this.drawEntityLabel(ctx, entity);
		}
	}

	public renderBack() {

		if (!this.isBackRerenderRequested) {
			this.isBackRerenderRequested = true;

			Promise.resolve().then(() => {
				this.isBackRerenderRequested =  false;
				this.backContext.clearRect(0, 0, this.world.width, this.world.height);
				entityPool
					.all()
					.forEach(entity => {
						if (entity.hasComponents(renderableComponent)) {
							if (!entity.hasComponents(velocityComponent)) {
								this.render(this.backContext, entity);
							}
						}
					});
			});
		}

	}

	public renderAnimationFrame() {
		this.animationFrameContext.clearRect(0, 0, this.world.width, this.world.height);

		// Only render items with velocity (animating)
		entityPool
			.filterComponents(renderableComponent, velocityComponent)
			.forEach(entity => {
				this.render(this.animationFrameContext, entity);
			});
	}

	private drawEntityLabel(ctx: CanvasRenderingContext2D, entity: IEntity & IPosition) {
		const text = `${entity.label}#${entity.id}`;
		if (entity.hasComponents(positionComponent)) {
			ctx.fillStyle = "#000";
			ctx.fillText(text, entity.x, entity.y - 1);
		}
	}

	private drawRect(ctx: CanvasRenderingContext2D, entity: IEntity & IPosition & IRenderable, fillColor: string) {
		if (
			positionComponent.isOn(entity) &&
			sizeComponent.isOn(entity)
		) {
			ctx.fillStyle = fillColor;
			ctx.fillRect(entity.x, entity.y, entity.width, entity.height);
		} else {
			console.error(`RenderSystem: A rect needs a position and a size component for rendering: ${entity.label}#${entity.id}`);
		}
	}

	private drawWorld(ctx: CanvasRenderingContext2D, world: IWorld & ISize) {
		ctx.fillStyle = "#ddd";
		ctx.fillRect(0, 0, world.width, world.height);
	}

	private drawBall(ctx: CanvasRenderingContext2D, ball: IPosition & ISize) {

		ctx.beginPath();
		ctx.rect(ball.x, ball.y, ball.width, ball.height);
		ctx.strokeStyle = "#22F";
		ctx.stroke();
		ctx.fillStyle = "#44F";
		ctx.fill();
	}

	private drawPowerBall(ctx: CanvasRenderingContext2D, ball: IPosition & ISize) {

		ctx.beginPath();
		ctx.rect(ball.x, ball.y, ball.width, ball.height);
		ctx.strokeStyle = "#FA0";
		ctx.stroke();

		// Get Color
		let color = "#F85";
		if (isEntity(ball)) {
			const metadata = this.metadata[ball.id];
			if (this.isPowerBallMetaData(metadata)) {
				metadata.cycle++;
				const colors = ["blue", "red", "green"];
				const colorIndex = Math.floor(metadata.cycle / 8 % colors.length);
				color = colors[colorIndex];
			} else {
				this.metadata[ball.id] = {
					cycle: 0
				};
			}
		}

		ctx.fillStyle = color;
		ctx.fill();
	}

	private drawParticle(ctx: CanvasRenderingContext2D, particle: IParticle) {
		this.drawRect(ctx, particle, particle.fillColor);
	}

	private drawPalette(ctx: CanvasRenderingContext2D, palette: IPalette) {
		this.drawRect(ctx, palette, "#888");
		this.insetEffect(ctx, palette);

		// Add Gun
		if (palette.bullets > 0) {
			this.drawGun(ctx, palette.x + 3, palette.y - 3);
			this.drawGun(ctx, palette.x + palette.width - 3 , palette.y - 3);

			ctx.font = "10px Arial";
			const width = ctx.measureText(palette.bullets.toString()).width;
			ctx.fillStyle = "#a00";
			ctx.fillText(palette.bullets.toString(), palette.x + (palette.width / 2) - (width / 2), palette.y + palette.height - 3) ;
		}

		ctx.drawImage(this.getCachedOverlay(palette), palette.x, palette.y);
	}

	private drawText(ctx: CanvasRenderingContext2D, text: IText) {
		ctx.fillStyle = text.fillColor;
		ctx.font = `${text.fontSize}px Arial`;
		const lines = text.text.split("\n");
		lines.forEach((line, lineNbr) => {
			const measuring = ctx.measureText(line);
			ctx.fillText(line, text.x - measuring.width / 2, text.y - text.fontSize / 2 + lines.length + (lineNbr * text.fontSize));
		});

	}

	private drawBlock(ctx: CanvasRenderingContext2D, block: IBlock) {

		this.drawRect(ctx, block, block.fillColor);
		this.drawCracks(ctx, block);

		if (!block.effect) {
			// Do nothing
		} else if (block.effect === "extraBall") {
			this.drawBall(ctx, {
				x: block.x + block.width / 2 - ballSize / 2,
				y: block.y + block.height / 2 - ballSize / 2,
				width: ballSize,
				height: ballSize
			});
		} else if (block.effect === "gun") {
			this.drawGun(ctx, block.x + block.width / 2, block.y + block.height / 2 + 1);
		} else if (block.effect === "powerball") {
			this.drawPowerBall(ctx, {
				x: block.x + block.width / 2 - powerBallSize / 2,
				y: block.y + block.height / 2 - powerBallSize / 2,
				width: powerBallSize,
				height: powerBallSize
			});
		} else {
			exhaustiveFail(block.effect);
		}

		// Add shaodw/spikkle overlay
		ctx.drawImage(this.getCachedOverlay(block), block.x, block.y, block.width, block.height);

	}

	private drawGun(ctx: CanvasRenderingContext2D, centerX: number, centerY: number) {

		const height = 6;
		const width = 4;

		const left = centerX - width / 2;
		const right = centerX + width / 2;
		const top = centerY - height / 2;
		const bottom = centerY + height / 2;

		ctx.beginPath();
		ctx.moveTo(left, bottom); // Bottom - Left
		ctx.lineTo(left, top + 3); // Up |
		ctx.lineTo(centerX, top); // /
		ctx.lineTo(right, top + 3); // \
		ctx.lineTo(right, bottom); // Down |
		ctx.closePath();
		ctx.fillStyle = "#F86";
		ctx.fill();
		ctx.strokeStyle = "#E2A";
		ctx.stroke();

	}

	private drawBullet(ctx: CanvasRenderingContext2D, entity: IBullet) {
		this.drawRect(ctx, entity, "orange");
	}


	private insetEffect(ctx: CanvasRenderingContext2D, entity: IPosition & ISize, shadowStrength = 0.5) {

		ctx.beginPath();
		ctx.moveTo(entity.x, entity.y + entity.height);
		ctx.lineTo(entity.x, entity.y);
		ctx.lineTo(entity.x + entity.width, entity.y);
		ctx.strokeStyle = `rgba(255, 255, 255, ${shadowStrength})`;
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(entity.x, entity.y + entity.height);
		ctx.lineTo(entity.x + entity.width, entity.y + entity.height);
		ctx.lineTo(entity.x + entity.width, entity.y);
		ctx.strokeStyle = `rgba(0, 0, 0, ${shadowStrength})`;
		ctx.stroke();
	}

	private static createBlockOverlay(size: ISize) {

		// create a temporary canvas to hold the gradient overlay
		const canvas = document.createElement("canvas");
		canvas.width = size.width;
		canvas.height = size.height;
		const ctx = canvas.getContext("2d")!;

		// Create a Pattern
		const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		let data = imgData.data;
		const toggleHeight = Math.floor(canvas.height / 2.6);

		for (let y = 0; y < canvas.height; y++) {
			for (let x = 0; x < canvas.width; x++) {
				const i = ((canvas.width * y) + x) * 4;

				if (i === toggleHeight) continue;
				// Black or white
				data[i] = data[i + 1] = data[i + 2] = y < toggleHeight ? 255 : 0;

				// Transparency: first and last less
				data[i + 3] = (x === 0 || y === 0 || x === canvas.width || y === canvas.height) ? 70 : 40 - 20 + Math.random() * 40;
			}
		}
		ctx.putImageData(imgData, 0, 0);

		return canvas;
	}

	private isBlockMetaData(metadata: IBlockMetaData | IPowerBallMetaData): metadata is IBlockMetaData {
		return !!metadata && !!(metadata as IBlockMetaData).crackLines;
	}

	private isPowerBallMetaData(metadata: IBlockMetaData | IPowerBallMetaData): metadata is IPowerBallMetaData {
		return !!metadata && typeof (metadata as IPowerBallMetaData).cycle === "number";
	}

	private drawCracks(ctx: CanvasRenderingContext2D, block: IBlock) {

		const blockMetaData = this.metadata[block.id];
		if (this.isBlockMetaData(blockMetaData)) {

			const lightColor = "rgba(255, 255, 255, 0.3)";
			const darkColor = "rgba(0, 0, 0, 0.3)";
			ctx.fillStyle = "";

			// Draw
			ctx.strokeStyle = darkColor;
			ctx.beginPath();
			for (const line of blockMetaData.crackLines) {
				ctx.moveTo(line[0], line[1]);
				ctx.lineTo(line[2], line[3]);
			}
			ctx.stroke();

			ctx.strokeStyle = lightColor;
			ctx.beginPath();
			for (const line of blockMetaData.crackLines) {
				ctx.moveTo(line[0] + 1, line[1] + 1);
				ctx.lineTo(line[2] + 1, line[3] + 1);
			}
			ctx.stroke();
		}
	}

	private getCrackLines(block: IBlock, impact: IPosition & ISize) {

		const randomness = 15;
		const breaks = 3;
		const breakLength = Math.min(block.width, block.height) / breaks;
		const lines: [number, number, number, number][] = [];

		// Point to start (point of impact)
		const startX = impact.x + impact.width / 2;
		const startY = impact.y + impact.height / 2;
		const startPos = clamp(startX, startY);

		// Start velocity to center (so visible)
		const dx = block.x + block.width / 2 - startPos.x + 0.4 - Math.random() * 0.8;
		const dy = block.y + block.height / 2 - startPos.y + 0.4 - Math.random()  * 0.8;

		function normalize(dx: number, dy: number): {dx: number; dy: number } {

			if (dx === 0 && dy === 0) return {dx, dy};
			const scale = Math.abs(dx) > Math.abs(dy) ? 1 / Math.abs(dx) : 1 / Math.abs(dy);
			return {dx: dx * scale, dy: dy * scale};
		}

		function clamp(x: number, y: number) {
			x = Math.max(Math.min(x, block.x + block.width - 1), block.x); // -1 for offset for shadow
			y = Math.max(Math.min(y, block.y + block.height - 1), block.y); // -1 for offset for shadow
			return {x, y};
		}

		function split(x: number, y: number, dx: number, dy: number, depth: number) {
			if (depth <= 0) return;

			// Add randomness to angle and length
			const nomalized = normalize(dx, dy);
			const randomLength = (Math.random() * 0.3 + 0.7) * breakLength;
			const nextX = x + nomalized.dx * randomLength;
			const nextY = y + nomalized.dy * randomLength;

			const clampedNextPos = clamp(nextX, nextY);

			// Add line
			lines.push([x, y, clampedNextPos.x, clampedNextPos.y]);

			// Recursion
			depth = depth - 1;
			split(clampedNextPos.x, clampedNextPos.y, dx + (randomness / 2) - (Math.random() * randomness), dy + (randomness / 2) - (Math.random() * randomness), depth);
			split(clampedNextPos.x, clampedNextPos.y, dx + (randomness / 2) - (Math.random() * randomness), dy + (randomness / 2) - (Math.random() * randomness), depth);

		}

		// Get lines to draw for break effect
		split(startPos.x, startPos.y, dx, dy, breaks);

		return lines;

	}


}
