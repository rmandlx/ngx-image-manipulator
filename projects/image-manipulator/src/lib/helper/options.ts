import { Subject } from 'rxjs';

/**
 * A Function that retrieves the RGBA data and returns the result of the transformation.
 * In order to show progress to the user, the progress can be given to the progressSubject.
 * Any function that will be used for image manipulation needs to be decorated with the TODO DECORATOR.
 */
export type ImageManipulationFunction = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  progressSubject: Subject<number>
) => Uint8ClampedArray;
