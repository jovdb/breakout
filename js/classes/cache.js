//export function createCache<T1, T2, T, TFn extends (arg1: T1, arg2: T2) => T>(getFunction: TFn, getId: (arg1: T1, arg2: T1) => string): TFn & ICache;
export function createCache(getFunction, getId) {
    const cacheObject = {};
    const cacheWrapper = (...args) => {
        // First check if we have a cached version
        const id = getId(...args);
        if (id in cacheObject)
            return cacheObject[id];
        // Get and cache result
        return cacheObject[id] = getFunction(...args);
    };
    // Add a clearCache function
    cacheWrapper.clearCache = () => {
        for (const key in cacheObject) {
            if (cacheObject.hasOwnProperty(key)) {
                delete cacheObject[key];
            }
        }
    };
    return cacheWrapper;
}
//# sourceMappingURL=cache.js.map