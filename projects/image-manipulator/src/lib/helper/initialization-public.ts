import { ImageManipulator } from './image-manipulator';
import * as Comlink from 'comlink';
import { Remote } from 'comlink';
import { Subject } from 'rxjs';

export function isWebWorkerAvailable(): boolean {
  //return typeof Worker !== 'undefined';
  return true;
}

function proxyWorker<T extends ImageManipulator>(given: Remote<T>): Remote<T> {
  const basicFunctionNames = Object.getOwnPropertyNames(
    ImageManipulator.prototype
  ).filter((item) => typeof (given as any)[item] === 'function');

  const proxied = new Proxy(given, {
    get: (target, prop, receiver) => {
      // @ts-ignore
      const calledStuff = target[prop];
      if (
        calledStuff instanceof Function &&
        typeof prop !== 'symbol' &&
        basicFunctionNames.find((name) => prop === name)
      ) {
        // should not be proxied
        return function (...args: any[]) {
          return new Promise((resolve) =>
            resolve(Reflect.apply(calledStuff, target, args))
          );
        };
      } else if (calledStuff instanceof Function) {
        return function (...args: any[]) {
          return new Promise(async (resolve) => {
            await target.reset();
            resolve(Reflect.apply(calledStuff, target, args));
          });
        };
      } else {
        return Reflect.get(target, prop, receiver);
      }
    },
  }) as Remote<T>;
  return proxied;
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
    return proxyWorker(obj);
  } else {
    const obj = manipulatorFactory();
    const callb = (progress: number) => {
      progressSubject.next(progress);
    };
    await obj.init(callb);
    return proxyWorker(obj as Remote<T>);
  }
}

export function initWebWorker(imageManipulator: ImageManipulator) {
  Comlink.expose(imageManipulator);
}
