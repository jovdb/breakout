
declare global {
	interface ICache {
		clearCache(): void;
	}
}

export function createCache<T1, T, TFn extends (arg1: T1) => T = (arg1: T1) => T>(getFunction: TFn, getId: (arg1: T1) => string): TFn & ICache;
//export function createCache<T1, T2, T, TFn extends (arg1: T1, arg2: T2) => T>(getFunction: TFn, getId: (arg1: T1, arg2: T1) => string): TFn & ICache;

export function createCache<T = undefined, TFn extends (...args: any[]) => T = (...args: any[]) => T>(getFunction: TFn, getId: (...args: any[]) => string) {
	const cacheObject: {[id: string]: T} = {};

	const cacheWrapper = (...args: any[]) => {

		// First check if we have a cached version
		const id = getId.apply(undefined, args);
		if (id in cacheObject) return cacheObject[id];

		// Get and cache result
		return cacheObject[id] = getFunction.apply(undefined, args);
	};

	// Add a clearCache function
	(cacheWrapper as any).clearCache = () => {
		for (const key in cacheObject) {
			if (cacheObject.hasOwnProperty(key)) {
				delete cacheObject[key];
			}
		}
	};

	return cacheWrapper;
}