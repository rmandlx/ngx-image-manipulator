export abstract class ImageManipulator {}

export class ConcreteImageManipulator {
  counter = 0;

  public inc() {
    this.counter += 1;
  }
}
