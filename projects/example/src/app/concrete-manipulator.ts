import { ImageManipulator } from '../../../image-manipulator/src/lib/helper';

export class ConcreteImageManipulator extends ImageManipulator {
  performWork() {
    if (this.callback == null) {
      console.log('Callback has not been initialized.');
      return;
    }

    let counter = 0;
    for (let i = 0; i < 1000000; i++) {
      counter += 1;
    }
    this.callback(10);
    for (let i = 0; i < 10000000; i++) {
      counter += 1;
    }
    this.callback(50);
    for (let i = 0; i < 10000000; i++) {
      counter += 1;
    }
    this.callback(100);
  }
}
