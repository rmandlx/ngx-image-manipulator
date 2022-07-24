import { progressCallback } from './worker-factory';
import * as Comlink from 'comlink';

export abstract class ImageManipulator {}

export class ConcreteImageManipulator {
  callback: (progressCallback & Comlink.ProxyMarked) | undefined;

  init(progress: progressCallback & Comlink.ProxyMarked) {
    this.callback = progress;
  }

  performWork() {
    if (this.callback == null) {
      alert('Callback has not been initialized.');
      return;
    }

    let counter = 0;
    for (let i = 0; i < 1000000; i++) {
      counter += 1;
    }
    this.callback(10);
    for (let i = 0; i < 10000000; i++) {
      counter += 1;
    }
    this.callback(50);
    for (let i = 0; i < 10000000; i++) {
      counter += 1;
    }
    this.callback(100);
  }
}
