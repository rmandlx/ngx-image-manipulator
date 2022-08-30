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
  title = 'example';

  blob: Blob | null = null;

  @ViewChild('manipulatorComponent')
  public manipulatorComponent: ImageManipulatorComponent | null = null;

  constructor(
    private manipulator: ManipulationService<ConcreteImageManipulator>
  ) {}

  async readyToTransform(): Promise<void> {
    if (this.manipulator == null || this.manipulatorComponent == null) {
      return;
    }

    const worker = await this.manipulator.getWorker();
    await this.manipulatorComponent.startTransform(
      worker.performWork,
      this.manipulator.getProgress()
    );
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (this.manipulator == null) {
      return;
    }
    this.blob = file;
  }
}
