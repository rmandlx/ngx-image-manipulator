import { Component, Inject } from '@angular/core';
import { IMAGEMANIPULATION_WEBWORKER_FACTORY } from './helper/worker-factory';

@Component({
  selector: 'ngx-image-manipulator',
  templateUrl: './image-manipulator.component.html',
  styleUrls: ['./image-manipulator.component.css'],
})
export class ImageManipulatorComponent {
  private _webWorker?: Worker;
  constructor(
    @Inject(IMAGEMANIPULATION_WEBWORKER_FACTORY)
    workerFactory: () => Worker
  ) {
    this._webWorker = workerFactory();
  }

  postMessage() {
    this._webWorker?.postMessage('testmessage');
  }
}
