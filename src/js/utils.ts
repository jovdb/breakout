
declare global {

	type Diff<T extends string, U extends string> = ({[P in T]: P } & {[P in U]: never } & { [x: string]: never })[T];

}

/**
 * Force a compile time error when fail canbe reached (usefull for exhaustive switch/if)
 * @param x type that should not be reached* @param x
 * @param dontThrow optional Usefull when you want to handle all cases of a subset of a type but don't want to throw at runtime
 */
export function exhaustiveFail(x: never, dontThrow: true): void;
export function exhaustiveFail(x: never): never;
export function exhaustiveFail(x: never, dontThrow = false): void | never {
	if (!(dontThrow)) throw new Error(`Unexpected object: ${x}`);
}

export function lightenColor(hexColor: string, amount = 0.5) {
	if (amount === 0) return hexColor;
	if (hexColor.length === 4 && hexColor[0] === "#") {
		const r = parseInt(hexColor[1], 16);
		const g = parseInt(hexColor[2], 16);
		const b = parseInt(hexColor[3], 16);
		return `#${(r + Math.round((15 - r) * amount)).toString(16)}${(g + Math.round((15 - g) * amount)).toString(16)}${(b + Math.round((15 - b) * amount)).toString(16)}`;
	}
	return hexColor;
}
