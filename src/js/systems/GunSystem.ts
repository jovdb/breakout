import { broadcaster } from "../classes/Broadcaster.js";
import { entityPool } from "../classes/Pool.js";
import { createBullet } from "../entities/Bullet.js";
import { isGun } from "../entities/Gun.js";
import { isPalette } from "../entities/Palette.js";

export class GunSystem {

	public start(): () => void {

		let interval = 0;
		let shotCount = 0; //delay after first shot

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.which === 32) { // Space
				if (!interval) { // ignore multiple events
					this.fire(); // firse once

					// Use interval instead of key events, to have more control
					interval = setInterval(() => {
						if (shotCount > 3) this.fire(); // Wait at start some intervals so a single shot can be performed
						shotCount++;
					}, 50);
				}
			}
		};

		const handleKeyUp = (e: KeyboardEvent) => {
			if (e.which === 32) { // Space
				clearInterval(interval); // Stop shotting
				shotCount = 0;
				interval = 0;
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("keyup", handleKeyUp);

		// Listen to collision messages
		const broadcasterUnsubscribe = broadcaster.subscribeOnMessage("Collision", message => {

			// Make a normal ball when falls from block
			if (isGun(message.entity) && isPalette(message.collidedWith)) {
				message.entity.dispose();
				message.collidedWith.bullets += 10;
			}
		});

		// Unsubscribe
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("keyup", handleKeyUp);
			broadcasterUnsubscribe();
		};

	}

	private fire() {

		// Let all palettes with bullets shoot
		entityPool.all().filter(isPalette).forEach(palette => {
			if (palette.bullets > 0) {
				palette.bullets--;

				// Shoot alternated left and right
				const x = palette.bullets % 2 ? palette.x + 3 : palette.x + palette.width - 3;
				createBullet(x, palette.y - 10);
			}
		});

	}
}
