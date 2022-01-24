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
    ): Promise<TT[]>;
    forEachAsyncConcurrent(
      this: T[],
      callback: (item: T, index?: number, array?: T[]) => Promise<void>,
      threadCount?: number
    ): Promise<void>;
    mapAsyncConcurrent<TT>(
      this: T[],
      callback: (item: T, index?: number, array?: T[]) => Promise<TT>,
      threadCount?: number
    ): Promise<TT[]>;
    min(this: T[], callback: (item: T) => number): number;
    max(this: T[], callback: (item: T) => number): number;
  }
}

if (!Array.prototype.min) {
  Array.prototype.min = function min<T>(
    this: T[],
    callback: (item: T) => number
  ): number {
    return Math.min(...this.map(callback).filter((v) => !isNaN(v)));
  };
}

if (!Array.prototype.max) {
  Array.prototype.max = function min<T>(
    this: T[],
    callback: (item: T) => number
  ): number {
    return Math.max(...this.map(callback).filter((v) => !isNaN(v)));
  };
}

if (!Array.prototype.forEachAsync) {
  Array.prototype.forEachAsync = async function forEachAsync<T>(
    this: T[],
    callback: (item: T, index?: number, array?: T[]) => Promise<void>
  ): Promise<void> {
    for (let index = 0; index < this.length; index++) {
      await callback(this[index], index, this);
    }
  };
}

if (!Array.prototype.mapAsync) {
  Array.prototype.mapAsync = async function mapAsync<T, TT>(
    this: T[],
    callback: (item: T, index?: number, array?: T[]) => Promise<TT>
  ): Promise<TT[]> {
    var result: TT[] = [];
    for (let index = 0; index < this.length; index++) {
      result.push(await callback(this[index], index, this));
    }
    return result;
  };
}

if (!Array.prototype.forEachAsyncConcurrent) {
  interface IResolve {
    resolved: boolean;
  }

  interface IPromiseItem<T> {
    item: T;
  }

  Array.prototype.forEachAsyncConcurrent = async function forEachConcurrent<T>(
    this: T[],
    callback: (item: T, index?: number, array?: T[]) => Promise<void>,
    threadCount?: number
  ) {
    return new Promise(async (resolve) => {
      var countLeft = this.length;
      if (threadCount == null) threadCount = this.length;

      var running: (Promise<T & IResolve> & IPromiseItem<T & IResolve>)[] = [];
      do {
        while (running.length < threadCount && countLeft > 0) {
          var itemIndex = this.length - countLeft;
          var item = this[itemIndex] as T & IResolve;

          var runPromise = new Promise<T & IResolve>(async (resolve) => {
            item.resolved = true;
            await callback(item, itemIndex, this);
            resolve(item);
          }) as Promise<T & IResolve> & IPromiseItem<T & IResolve>;
          runPromise.item = item;
          running.push(runPromise);

          countLeft--;
        }
        await promiseAny(running);
        running
          .filter((r) => r.item.resolved)
          .forEach((i) => {
            running.splice(running.indexOf(i), 1);
          });
      } while (countLeft > 0);

      await Promise.all(running);
      resolve();
      for (let index = 0; index < this.length; index++) {
        callback(this[index], index, this);
      }
    });
  };
}

if (!Array.prototype.mapAsyncConcurrent) {
  Array.prototype.mapAsyncConcurrent = async function mapConcurrent<T, TT>(
    this: T[],
    callback: (item: T, index?: number, array?: T[]) => Promise<TT>,
    threadCount?: number
  ): Promise<TT[]> {
    return new Promise(async (resolve) => {
      var countLeft = this.length;
      if (threadCount == null) threadCount = this.length;

      var running: Promise<TT>[] = [];
      var results: TT[] = [];
      do {
        while (running.length < threadCount && countLeft > 0) {
          var itemIndex = this.length - countLeft;
          var item = this[itemIndex];
          running.push(
            new Promise<TT>(async (resolve) => {
              var result = await callback(item, itemIndex, this);
              resolve(result);
            })
          );
          countLeft--;
        }
        var doneTask = (await promiseAny(running)) as Promise<TT>;
        if (doneTask) {
          running.splice(running.indexOf(doneTask), 1);
          results.push(await doneTask);
        }
      } while (countLeft > 0);

      await Promise.all(running);
      resolve(results);
      for (let index = 0; index < this.length; index++) {
        callback(this[index], index, this);
      }
    });
  };
}
