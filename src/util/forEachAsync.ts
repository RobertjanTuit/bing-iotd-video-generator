export {};
import promiseAny from "promise-any";

declare global {
  interface Array<T> {
    forEachAsync(
      this: T[],
      callback: (item: T, index?: number, array?: T[]) => Promise<void>
    ): Promise<void>;
    mapAsync<TT>(
      this: T[],
      callback: (item: T, index?: number, array?: T[]) => Promise<TT>
    ): Promise<void>;
    forEachAsyncConcurrent(
      this: T[],
      callback: (item: T, index?: number, array?: T[]) => Promise<void>,
      threadCount?: number
    );
  }
}
if (!Array.prototype.forEachAsync) {
  Array.prototype.forEachAsync = async function forEachAsync<T>(
    this: T[],
    callback: (item: T, index?: number, array?: T[]) => Promise<void>
  ) {
    for (let index = 0; index < this.length; index++) {
      await callback(this[index], index, this);
    }
  };

  Array.prototype.mapAsync = async function mapAsync<T, TT>(
    this: T[],
    callback: (item: T, index?: number, array?: T[]) => Promise<TT>
  ) {
    for (let index = 0; index < this.length; index++) {
      await callback(this[index], index, this);
    }
  };

  Array.prototype.forEachAsyncConcurrent = async function forEachConcurrent<T>(
    this: T[],
    callback: (item: T, index?: number, array?: T[]) => Promise<void>,
    threadCount?: number
  ) {
    return new Promise(async (resolve) => {
      var countLeft = this.length;
      if (threadCount == null) threadCount = this.length;

      var running: Promise<T>[] = [];
      do {
        while (running.length < threadCount && countLeft > 0) {
          var itemIndex = this.length - countLeft;
          var item = this[itemIndex];
          running.push(
            new Promise<T>(async (resolve) => {
              await callback(item, itemIndex, this);
              resolve(item);
            })
          );
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
