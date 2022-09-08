import { progressCallback } from '../helper';

/**
 * Base class for custom image manipulation classes. Provides the basic functionality that is required for the ImageManipulatorComponent to show
 * progress and the final result.
 * The initialization function only needs to be called inside this library!
 */
export abstract class ImageManipulator {
  protected callback: progressCallback | null = null;
  protected stopCounter = 0;

  init(progress: progressCallback): void {
    this.callback = progress;
  }

  stop(): void {
    this.stopCounter += 1;
  }

  /**
   * Can be used to show progress to the frontend.
   * Whenever this Method is called, the worker gets the opportunity to stop the execution of the current function!
   */
  async progressCallback(progress: number): Promise<void> {
    if (this.callback == null) {
      throw new Error('No progress callback initialized.');
    }

    // This allows that the stop function may be called.
    await new Promise((resolve) => setTimeout(resolve, 0));

    if (this.stopCounter > 0) {
      this.stopCounter -= 1;
      throw new Error('Function was stopped!');
    }

    this.callback(progress);
  }
}
