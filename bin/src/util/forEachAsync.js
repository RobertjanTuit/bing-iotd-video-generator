import promiseAny from "promise-any";
if (!Array.prototype.forEachAsync) {
    Array.prototype.forEachAsync = async function forEachAsync(callback) {
        for (let index = 0; index < this.length; index++) {
            await callback(this[index], index, this);
        }
    };
    Array.prototype.mapAsync = async function mapAsync(callback) {
        for (let index = 0; index < this.length; index++) {
            await callback(this[index], index, this);
        }
    };
    Array.prototype.forEachAsyncConcurrent = async function forEachConcurrent(callback, threadCount) {
        return new Promise(async (resolve) => {
            var countLeft = this.length;
            if (threadCount == null)
                threadCount = this.length;
            var running = [];
            do {
                while (running.length < threadCount && countLeft > 0) {
                    var itemIndex = this.length - countLeft;
                    var item = this[itemIndex];
                    running.push(new Promise(async (resolve) => {
                        await callback(item, itemIndex, this);
                        resolve(item);
                    }));
                    countLeft--;
                }
                var doneTask = await promiseAny(running);
                if (doneTask) {
                    running = running.splice(running.indexOf(doneTask), 1);
                }
            } while (countLeft > 0);
            await Promise.all(running);
            resolve(this);
            for (let index = 0; index < this.length; index++) {
                callback(this[index], index, this);
            }
        });
    };
}
//# sourceMappingURL=forEachAsync.js.map