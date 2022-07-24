import * as Comlink from 'comlink';
import { Remote } from 'comlink';
import { ConcreteImageManipulator } from './image-manipulator';
import { Subject } from 'rxjs';

export async function initLocal(
  workerFactory: () => Worker,
  progressSubject: Subject<number>
): Promise<Remote<ConcreteImageManipulator>> {
  const obj = Comlink.wrap(workerFactory()) as Remote<ConcreteImageManipulator>;
  const callbProxy = Comlink.proxy((progress: number) => {
    progressSubject.next(progress);
  });
  await obj.init(callbProxy);
  return obj;
}

export function initWebWorker() {
  Comlink.expose(new ConcreteImageManipulator());
}
