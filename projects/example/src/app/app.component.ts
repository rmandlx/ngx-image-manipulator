import { Component, ViewChild } from '@angular/core';
import {
  ImageManipulatorComponent,
  ManipulationService,
  transformBlobToImageData,
  transformImageDataToBase64,
  transformImageDataToBlob,
} from 'image-manipulator';
import { ConcreteImageManipulator } from './concrete-manipulator';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  blob: ImageData | null = null;
  readyForTransformation = false;

  @ViewChild('manipulatorComponent')
  public manipulatorComponent: ImageManipulatorComponent | null = null;

  constructor(
    private readonly manipulatorService: ManipulationService<ConcreteImageManipulator>
  ) {}

  async finishedTransform(data: ImageData): Promise<void> {
    console.log('Width: ' + data.width + ' Height: ' + data.height);
    console.log('transforming finished data to blob:');
    console.log(await transformImageDataToBlob(data));
    console.log('transforming finished data to base64:');
    console.log(await transformImageDataToBase64(data));
  }

  async startTransform(): Promise<void> {
    if (this.manipulatorComponent == null) {
      throw new Error(
        'Cannot transform when the ManipulatorComponent is not initialized.'
      );
    }

    const worker = await this.manipulatorService.getWorker();
    this.manipulatorComponent.startTransform(
      worker.edgeDetection,
      this.manipulatorService.getProgress()
    );
  }

  async stopTransform(): Promise<void> {
    if (this.manipulatorComponent == null) {
      throw new Error(
        'Cannot transform when the ManipulatorComponent is not initialized.'
      );
    }

    const worker = await this.manipulatorService.getWorker();
    worker.stop();
  }
  /**
   * File selection inputs the data to the image manipulator component.
   * After the image manipulator component finished the data transformation, it will emit the readyToTransform event.
   */
  async onFileSelected(event: any) {
    console.log('Selected blob:');
    console.log(event.target.files[0]);
    console.log('converting to base64:');
    const b64 = await transformBlobToImageData(event.target.files[0]);
    console.log(b64);
    this.blob = b64;
  }
}
