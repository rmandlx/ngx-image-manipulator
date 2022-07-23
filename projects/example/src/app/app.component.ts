import { Component } from '@angular/core';
import * as Comlink from 'comlink';
import { Remote } from 'comlink';
import { ConcreteImageManipulator } from 'image-manipulator';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'example';

  constructor() {}

  async test() {
    const worker = new Worker(new URL('test.worker', import.meta.url));
    // WebWorkers use `postMessage` and therefore work with Comlink.
    const obj = Comlink.wrap(worker) as Remote<ConcreteImageManipulator>;
    alert(`Counter: ${await obj.counter}`);
    await obj.inc();
    alert(`Counter: ${await obj.counter}`);
  }
}
