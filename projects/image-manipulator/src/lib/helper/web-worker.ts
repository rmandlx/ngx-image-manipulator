import * as Comlink from 'comlink';
import { Remote } from 'comlink';
import { ImageManipulator } from './image-manipulator';
import { Subject } from 'rxjs';

export async function initLocal<T extends ImageManipulator>(
  workerFactory: () => Worker,
  progressSubject: Subject<number>
): Promise<Remote<T>> {
  const obj = Comlink.wrap(workerFactory()) as Remote<T>;
  const callbProxy = Comlink.proxy((progress: number) => {
    progressSubject.next(progress);
  });
  await obj.init(callbProxy);
  return obj;
}

export function initWebWorker(imageManipulator: ImageManipulator) {
  Comlink.expose(imageManipulator);
}
