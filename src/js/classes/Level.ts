// This could becoe a system that listens to messages
declare global {
	interface ILevel {
		startBallVelocity: number;
		maxBallVelocity: number;
		ballVelocityAcceleration: number;
	}

	interface IBlockConfig {
		row: number;
		col: number;
		strength?: number;
		effect?: BlockEffect;
		color?: string;
	}
}

export class Level implements ILevel {

	public startBallVelocity: number;
	public maxBallVelocity: number;
	public ballVelocityAcceleration: number;

	public rowCount: number;
	public columnCount: number;
	public blocks: IBlockConfig[];


	constructor() {
		this.startBallVelocity = 2;
		this.maxBallVelocity = 3;
		this.ballVelocityAcceleration = 1.0005;

		this.blocks = [];

		this.rowCount = 15;
		this.columnCount = 20;

		const hideRow = this.hideRow();
		const hideCol = this.hideCol();
		const getEffect = this.getEffect();
		const getColor = this.getColor();
		const getStrength = this.getStrength();

		for (let row = 0; row < 10; row++) {
			if (hideRow(row)) continue;

			for (let col = 0; col < this.columnCount; col++) {
				if (hideCol(col)) continue;

				const strength = getStrength(col, row);
				this.blocks.push({
					row,
					col,
					strength,
					effect: getEffect(col, row),
					color: getColor(col, row)
				});
			}
		}
	}

	private getRandomInt(max: number) {
		return Math.floor(Math.random() * (max + 1));
	}

	private hideRow(): (row: number) => boolean  {
		return () => !this.getRandomInt(0.7);
	}

	private hideCol(): (col: number) => boolean  {
		return this.getRandomCols();
	}

	private getStrength(): (col: number, row: number) => number {
		const getRandomCols = this.getRandomCols();
		const getRandomRows = this.getRandomRows();
		return (col: number, row: number) => {
			return getRandomCols(col) || getRandomRows(row) ? 3 : 1;
		};
	}

	private getRandomRows(chanceRatio = 1) {
		const size = this.rowCount;
		let offset = this.getRandomInt(size / 2) + 2; // + 1 to prevent all
		const mod = this.getRandomInt(size);
		if (Math.random() > chanceRatio) offset = -1; // Don't let it occure

		return (row: number) => {
			return row % mod === offset;
		};
	}

	private getRandomCols(chanceRatio = 1) {
		const half = Math.floor(this.columnCount / 2);
		let offset = this.getRandomInt(half);
		const mod = Math.max(2, this.getRandomInt(half)); // max to prevent all
		if (Math.random() > chanceRatio) offset = -1; // Don't let it occure

		return (col: number) => {

			let value = col;
			if (col >= half) value = this.columnCount - 1 - col;
			return value % mod === offset;
		};
	}

	private getEffect(): (col: number, row: number) => BlockEffect | undefined {

		const changeRatio = 0.8;
		const getRandomBallRows = this.getRandomRows(changeRatio);
		const getRandomBallCols = this.getRandomCols(changeRatio);
		const getRandomGunRows = this.getRandomRows(changeRatio);
		const getRandomGunCols = this.getRandomCols(changeRatio);
		const getRandomPowerBallRows = this.getRandomRows(changeRatio);
		const getRandomPowerBallCols = this.getRandomCols(changeRatio);

		return (col: number, row: number) => {
			if (getRandomBallRows(row)) return "extraBall";
			if (getRandomBallCols(col)) return "extraBall";
			if (getRandomGunRows(row)) return "gun";
			if (getRandomGunCols(col)) return "gun";
			if (getRandomPowerBallRows(row)) return "powerball";
			if (getRandomPowerBallCols(col)) return "powerball";
			return undefined;
		};
	}

	private getColor() {
		const colors = ["#f00", "#080", "#f0f", "#808", "#f60"];
		return (_col: number, _row: number) => {
			return colors[Math.floor(Math.random() * colors.length)];
		};

	}
}

export const level = new Level();
