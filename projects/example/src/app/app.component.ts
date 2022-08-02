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

  constructor() {}

  test() {
    this.manipulator?.retrieveManipulator().performWork();
  }
}
