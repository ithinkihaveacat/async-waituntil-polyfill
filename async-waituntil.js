{
  const waitUntil = ExtendableEvent.prototype.waitUntil;
  const respondWith = FetchEvent.prototype.respondWith;
  const promisesMap = new WeakMap();

  ExtendableEvent.prototype.waitUntil = function(promise) {
    const extendableEvent = this;

    const promises = promisesMap.get(extendableEvent);

    if (promises) {
      promisesMap[extendableEvent] = promises.then(() => {
        return promise;
      });
    } else {
      promisesMap.set(extendableEvent, Promise.resolve());
      waitUntil.call(extendableEvent, promise.then(() => {
        return promisesMap[extendableEvent];
      }));
    }
  };

  FetchEvent.prototype.respondWith = function(promise) {
    this.waitUntil(promise);
    return respondWith.call(this, promise);
  };
}
