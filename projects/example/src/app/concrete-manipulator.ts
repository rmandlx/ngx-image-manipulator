import { ImageManipulator } from 'image-manipulator';

export class ConcreteImageManipulator extends ImageManipulator {
  async performWork() {
    let counter = 0;
    for (let i = 0; i < 100000000; i++) {
      counter += 1;
    }
    await this.progressCallback(10);
    for (let i = 0; i < 100000000; i++) {
      counter += 1;
    }
    await this.progressCallback(50);
    for (let i = 0; i < 100000000; i++) {
      counter += 1;
    }
    await this.progressCallback(100);
  }
}
