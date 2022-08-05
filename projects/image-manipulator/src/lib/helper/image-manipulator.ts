import { progressCallback } from './worker-factory';
import * as Comlink from 'comlink';

/**
 * Base class for custom image manipulation classes. Provides the basic functionality that is required for the ImageManipulatorComponent to show
 * progress and the final result.
 * The initialization function only needs to be called inside this library!
 */
export abstract class ImageManipulator {
  callback: (progressCallback & Comlink.ProxyMarked) | undefined;

  init(progress: progressCallback & Comlink.ProxyMarked) {
    this.callback = progress;
  }
}
