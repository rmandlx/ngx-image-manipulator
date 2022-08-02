import { progressCallback } from './worker-factory';
import * as Comlink from 'comlink';

export abstract class ImageManipulator {
  callback: (progressCallback & Comlink.ProxyMarked) | undefined;

  init(progress: progressCallback & Comlink.ProxyMarked) {
    this.callback = progress;
  }
}
