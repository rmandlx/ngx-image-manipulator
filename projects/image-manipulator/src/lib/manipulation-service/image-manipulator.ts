import { progressCallback, TransformationCancelledError } from '../helper';

/**
 * Base class for custom image manipulation classes. Provides the basic functionality that is required for the ImageManipulatorComponent to show
 * progress and the final result.
 */
export abstract class ImageManipulator {
  protected callback: progressCallback | null = null;
  protected stopCounter = 0;

  private init(progress: progressCallback): void {
    this.callback = progress;
  }

  stopExecution(): void {
    this.stopCounter += 1;
  }

  /**
   * Can be used to deliver information on progress to the main thread.
   * Whenever this method is called, the worker gets the opportunity to stop the execution of the current function!
   */
  async setProgress(progress: number): Promise<void> {
    if (this.callback == null) {
      throw new Error(
        'The progress callback has not been initialized. Most likely the init method was not called.'
      );
    }

    // This allows that the stop function may be called.
    await new Promise((resolve) => setTimeout(resolve, 0));

    if (this.stopCounter > 0) {
      this.stopCounter -= 1;
      throw new TransformationCancelledError(
        'The execution of the transformation was stopped.',
        progress
      );
    }

    this.callback(progress);
  }
}
