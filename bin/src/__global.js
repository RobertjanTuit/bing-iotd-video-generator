if (!Array.prototype.forEachAsync) {
    Array.prototype.forEachAsync = async function forEachAsync(callback) {
        for (let index = 0; index < this.length; index++) {
            await callback(this[index], index, this);
        }
    };
}
export {};
//# sourceMappingURL=__global.js.map