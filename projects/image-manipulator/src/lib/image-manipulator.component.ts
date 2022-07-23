import { Component, Inject } from '@angular/core';
import { IMAGEMANIPULATION_WEBWORKER_FACTORY } from './helper/worker-factory';
import { ConcreteImageManipulator } from './helper/image-manipulator';
import * as Comlink from 'comlink';
import { Remote } from 'comlink';

@Component({
  selector: 'ngx-image-manipulator',
  templateUrl: './image-manipulator.component.html',
  styleUrls: ['./image-manipulator.component.css'],
})
export class ImageManipulatorComponent {
  private _webWorker?: Worker;
  private manipulator: Remote<ConcreteImageManipulator>;
  constructor(
    @Inject(IMAGEMANIPULATION_WEBWORKER_FACTORY)
    workerFactory: () => Worker
  ) {
    this._webWorker = workerFactory();
    this.manipulator = Comlink.wrap(this._webWorker);
  }

  postMessage() {
    this.manipulator.inc();
    console.log('inc value: ' + this.manipulator.counter);
  }
}
