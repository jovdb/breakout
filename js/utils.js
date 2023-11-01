export function exhaustiveFail(x, dontThrow = false) {
    if (!(dontThrow))
        throw new Error(`Unexpected object: ${x}`);
}
export function lightenColor(hexColor, amount = 0.5) {
    if (amount === 0)
        return hexColor;
    if (hexColor.length === 4 && hexColor[0] === "#") {
        const r = parseInt(hexColor[1], 16);
        const g = parseInt(hexColor[2], 16);
        const b = parseInt(hexColor[3], 16);
        return `#${(r + Math.round((15 - r) * amount)).toString(16)}${(g + Math.round((15 - g) * amount)).toString(16)}${(b + Math.round((15 - b) * amount)).toString(16)}`;
    }
    return hexColor;
}
//# sourceMappingURL=utils.js.map