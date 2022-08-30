import { ImageManipulator } from 'image-manipulator';

export class ConcreteImageManipulator extends ImageManipulator {
  async edgeDetection(imageData: ImageData): Promise<ImageData> {
    await this.progressCallback(0);

    const result = new Uint8ClampedArray(imageData.data.length);
    result.fill(255);

    for (let x = 0; x < imageData.width; x++) {
      // We devide the loop over x in 10 progress steps
      if (x % Math.floor(imageData.width / 10) === 0) {
        await this.progressCallback(
          Math.floor(x / (imageData.width / 10)) * 10
        );
      }

      for (let y = 0; y < imageData.height; y++) {
        const index = (x + y * imageData.width) * 4;
        const indexLeft = index - 4;
        const indexRight = index + 4;
        const indexUp = index - imageData.width * 4;
        const indexDown = index + imageData.width * 4;
        if (
          x === 0 ||
          x === imageData.width - 1 ||
          y === 0 ||
          y === imageData.height - 1
        ) {
          result[index] = 255;
          result[index + 1] = 255;
          result[index + 2] = 255;
          continue;
        }

        const dxR = imageData.data[indexLeft] - imageData.data[indexRight];
        const dyR = imageData.data[indexUp] - imageData.data[indexDown];
        const magR = Math.sqrt(dxR * dxR + dyR * dyR);

        const dxG =
          imageData.data[indexLeft + 1] - imageData.data[indexRight + 1];
        const dyG = imageData.data[indexUp + 1] - imageData.data[indexDown + 1];
        const magG = Math.sqrt(dxG * dxG + dyG * dyG);

        const dxB =
          imageData.data[indexLeft + 1] - imageData.data[indexRight + 1];
        const dyB = imageData.data[indexUp + 1] - imageData.data[indexDown + 1];
        const magB = Math.sqrt(dxB * dxB + dyB * dyB);

        let max = magR;
        if (magG > max) {
          max = magG;
        }
        if (magB > max) {
          max = magB;
        }
        result[index] = max;
        result[index + 1] = max;
        result[index + 2] = max;
      }
    }

    await this.progressCallback(100);
    return new ImageData(result, imageData.width, imageData.height);
  }
}
