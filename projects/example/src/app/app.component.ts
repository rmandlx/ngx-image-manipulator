import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  ImageManipulatorComponent,
  ManipulationService,
} from 'image-manipulator';
import { ConcreteImageManipulator } from './concrete-manipulator';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  blob: Blob | null = null;
  currentlyTransforming = false;
  finishedImageData: ImageData | null = null;

  @ViewChild('manipulatorComponent')
  public manipulatorComponent: ImageManipulatorComponent | null = null;
  @ViewChild('canvasElement')
  public canvasElement: ElementRef<HTMLCanvasElement> | null = null;

  constructor(
    private readonly manipulatorService: ManipulationService<ConcreteImageManipulator>
  ) {}

  async finishedTransform(data: ImageData | ImageBitmap): Promise<void> {
    if (data instanceof ImageBitmap) {
      throw new Error('Expected ImageData');
    }

    console.log('Width: ' + data.width + ' Height: ' + data.height);
    this.finishedImageData = data;
    if (this.canvasElement != null) {
      const context = this.canvasElement.nativeElement.getContext('2d');
      if (context == null) {
        throw new Error('Could not retrieve 2d context of canvas element.');
      }
      this.canvasElement.nativeElement.width = data.width;
      this.canvasElement.nativeElement.height = data.height;
      context.putImageData(data, 0, 0);
    }
  }

  /**
   * Called by button to start the transform
   */
  async startTransform(): Promise<void> {
    if (this.manipulatorComponent == null) {
      throw new Error(
        'Cannot transform when the ManipulatorComponent is not initialized.'
      );
    }

    this.finishedImageData = null;

    const worker = await this.manipulatorService.getWorker();

    await this.manipulatorComponent.startTransform(
      worker.edgeDetection,
      this.manipulatorService.getProgress()
    );
  }

  /**
   * Called by button to stop the current transformation.
   */
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
   */
  async onFileSelected(event: any) {
    console.log('Blob was selected.');
    this.blob = event.target.files[0];
  }
}
