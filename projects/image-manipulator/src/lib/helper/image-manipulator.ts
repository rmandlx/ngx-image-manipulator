import { progressCallback } from './worker-factory';

/**
 * Base class for custom image manipulation classes. Provides the basic functionality that is required for the ImageManipulatorComponent to show
 * progress and the final result.
 * The initialization function only needs to be called inside this library!
 */
export abstract class ImageManipulator {
  private callback: progressCallback | null = null;
  stopFlag = false;

  init(progress: progressCallback): void {
    this.callback = progress;
  }

  stop(): void {
    if (this.callback != null) {
      this.callback(0);
    }
    this.stopFlag = true;
  }

  /**
   * Can be used to show progress to the frontend.
   * Whenever this Method is called, the worker gets the opportunity to stop the execution of the current function!
   */
  async progressCallback(progress: number): Promise<void> {
    if (this.callback == null) {
      throw new Error('No progress callback initialized.');
    }

    this.callback(progress);
    await new Promise((resolve) => setTimeout(resolve, 0));

    if (this.stopFlag) {
      this.stopFlag = false;
      throw new Error('Function was stopped!');
    }
  }
}
