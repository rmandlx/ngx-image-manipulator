import { Component, ViewChild } from '@angular/core';
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
  readyForTransformation = false;

  @ViewChild('manipulatorComponent')
  public manipulatorComponent: ImageManipulatorComponent | null = null;

  constructor(
    private readonly manipulatorService: ManipulationService<ConcreteImageManipulator>
  ) {}

  finishedTransform(data: ImageData): void {
    console.log('Width: ' + data.width + ' Height: ' + data.height);
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

  readyToTransform(ready: boolean): void {
    this.readyForTransformation = ready;
  }

  /**
   * File selection inputs the data to the image manipulator component.
   * After the image manipulator component finished the data transformation, it will emit the readyToTransform event.
   */
  onFileSelected(event: any) {
    this.blob = event.target.files[0];
  }
}
