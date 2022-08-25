import { ImageManipulator } from 'image-manipulator';

export class ConcreteImageManipulator extends ImageManipulator {
  async performWork(data: ImageData): Promise<ImageData> {
    await this.progressCallback(0);

    for (let x = 0; x < data.width; x += 1) {
      for (let y = 0; y < data.height; y += 1) {
        const index = (y * data.width + x) * 4;
        data.data[index] = 255 - data.data[index];
        data.data[index + 1] = 255 - data.data[index + 1];
        data.data[index + 2] = 255 - data.data[index + 2];
      }
    }

    await this.progressCallback(100);
    return data;
  }
}
