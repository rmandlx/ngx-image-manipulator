import * as Comlink from 'comlink';
import { Remote } from 'comlink';
import { Subject } from 'rxjs';
import { ImageManipulator } from '../manipulation-service';

export type progressCallback = (progress: number) => void;

export function isWebWorkerAvailable(): boolean {
  return typeof Worker !== 'undefined';
}

/**
 * Proxying is required, so that the Interface of the regular ImageManipulator matches to
 * Interface of the Remote<ImageManipulator>!
 */
function proxyWorker<T extends ImageManipulator>(given: Remote<T>): Remote<T> {
  return new Proxy(given, {
    get: (target, prop, receiver) => {
      // @ts-ignore
      const calledStuff = target[prop];
      if (calledStuff instanceof Function) {
        // Promisify functions
        return function (...args: any[]) {
          return new Promise((resolve) =>
            resolve(Reflect.apply(calledStuff, target, args))
          );
        };
      } else {
        return Reflect.get(target, prop, receiver);
      }
    },
  }) as Remote<T>;
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
    // Making sure, that init is only called in this library, but this is hacky!
    // @ts-ignore
    await obj.init(callbProxy);
    return obj;
  } else {
    const obj = manipulatorFactory();
    const callbProxy = (progress: number) => {
      progressSubject.next(progress);
    };
    // Making sure, that init is only called in this library, but this is hacky!
    // @ts-ignore
    await obj.init(callbProxy);
    return proxyWorker(obj as Remote<T>);
  }
}

export function initWebWorker(imageManipulator: ImageManipulator) {
  Comlink.expose(imageManipulator);
}
