{
  const waitUntil = ExtendableEvent.prototype.waitUntil;
  const respondWith = FetchEvent.prototype.respondWith;
  const promisesMap = new WeakMap();

  ExtendableEvent.prototype.waitUntil = function(promise) {
    const extendableEvent = this;

    const head = () => promisesMap.get(extendableEvent);

    if (head()) {
      promisesMap.set(extendableEvent, head().then(() => promise));
    } else {
      promisesMap.set(extendableEvent, Promise.resolve());
      waitUntil.call(extendableEvent, promise.then(function processPromises() {
        const h = head();
        return h.then(() => {
          return h === head() ? Promise.resolve() : processPromises(); // Has head moved?
        });
      }));
    }
  };

  FetchEvent.prototype.respondWith = function(promise) {
    this.waitUntil(promise);
    return respondWith.call(this, promise);
  };
}
