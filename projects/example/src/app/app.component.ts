import { Component, ViewChild } from '@angular/core';
import { ImageManipulatorComponent } from 'image-manipulator';
import { ConcreteImageManipulator } from './concrete-manipulator';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'example';
  @ViewChild('manipulator')
  manipulator: ImageManipulatorComponent<ConcreteImageManipulator> | null = null;

  blob: Blob | null = null;

  constructor() {}

  async stop() {
    const manipulator = this.manipulator?.retrieveManipulator();
    await manipulator?.stop();
  }

  getManipulatorClass() {
    return ConcreteImageManipulator;
  }

  readyToTransform(): void {
    if (this.manipulator == null) {
      return;
    }
    const manip = this.manipulator.retrieveManipulator();
    if (manip == null) {
      return;
    }
    this.manipulator.startTransform((data) => {
      return manip.performWork(data);
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (this.manipulator == null) {
      return;
    }
    this.blob = file;
  }
}
