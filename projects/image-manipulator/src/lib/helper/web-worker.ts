import * as Comlink from 'comlink';

export function initWebWorker() {
  Comlink.expose({
    counter: 0,
    inc() {
      this.counter += 1;
    },
  });
}
