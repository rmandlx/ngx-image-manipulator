import { ImageManipulator } from './image-manipulator';
import * as Comlink from 'comlink';
import { Remote } from 'comlink';
import { Subject } from 'rxjs';

export function isWebWorkerAvailable(): boolean {
  //return typeof Worker !== 'undefined';
  return true;
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
    /*
    const proxied = new Proxy(manipulatorFactory(), {
      get: (target, prop, receiver) => {
        // @ts-ignore
        const calledStuff = target[prop];
        if (calledStuff instanceof Function) {
          return function (...args: any[]) {
            return calledStuff.apply(target, args);
          };
        } else {
          return Reflect.get(target, prop, receiver);
        }
      },
    }) as Remote<T>;
     */
    const obj = manipulatorFactory();
    const callb = (progress: number) => {
      progressSubject.next(progress);
    };
    await obj.init(callb);
    return obj as Remote<T>;
  }
}

export function initWebWorker(imageManipulator: ImageManipulator) {
  Comlink.expose(imageManipulator);
}
