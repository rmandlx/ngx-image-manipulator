import { Component, Inject } from '@angular/core';
import { IMAGEMANIPULATION_WEBWORKER_FACTORY } from './helper/worker-factory';
import { ConcreteImageManipulator, initLocal, initWebWorker } from './helper';
import { Remote } from 'comlink';
import { Subject } from 'rxjs';

@Component({
  selector: 'ngx-image-manipulator',
  templateUrl: './image-manipulator.component.html',
  styleUrls: ['./image-manipulator.component.css'],
})
export class ImageManipulatorComponent {
  private comlinkObj: Remote<ConcreteImageManipulator> | undefined = undefined;
  private sub: Subject<number> = new Subject<number>();
  public currentProgress: number = 0;
  constructor(
    @Inject(IMAGEMANIPULATION_WEBWORKER_FACTORY)
    private readonly workerFactory: () => Worker
  ) {
    this.sub.subscribe((num) => (this.currentProgress = num));
  }

  async initWebworker() {
    initWebWorker();
    this.comlinkObj = await initLocal(this.workerFactory, this.sub);
  }

  test() {
    this.comlinkObj?.performWork();
  }
}
