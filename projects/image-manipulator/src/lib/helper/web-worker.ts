import * as Comlink from 'comlink';
import { Remote } from 'comlink';
import { ImageManipulator } from './image-manipulator';
import { Subject } from 'rxjs';

export function isWebWorkerAvailable(): boolean {
  //return typeof Worker !== 'undefined';
  return false;
}

export async function initLocal<T extends ImageManipulator>(
  workerFactory: () => Worker,
  manipulatorFactory: () => T,
  progressSubject: Subject<number>
): Promise<Remote<T>> {
  if (isWebWorkerAvailable()) {
    const obj = Comlink.wrap<T>(workerFactory());
    const callbProxy = Comlink.proxy((progress: number) => {
      progressSubject.next(progress);
    });
    await obj.init(callbProxy);
    return obj;
  } else {
    return new Proxy(manipulatorFactory(), {
      get: (target, prop, receiver) => {
        // @ts-ignore
        const calledStuff = target[prop];
        if (calledStuff instanceof Function) {
          return function (...args: any[]) {
            return new Promise((resolve) => resolve(calledStuff.apply(args)));
          };
        } else {
          return new Promise((resolve, reject) =>
            resolve(Reflect.get(target, prop, receiver))
          );
        }
      },
    }) as Remote<T>;
  }
}

export function initWebWorker(imageManipulator: ImageManipulator) {
  Comlink.expose(imageManipulator);
}
