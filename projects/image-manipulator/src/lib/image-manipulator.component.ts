import { Component, Inject, OnInit } from '@angular/core';
import { IMAGEMANIPULATION_WEBWORKER_FACTORY } from './helper/worker-factory';
import { ImageManipulator, initLocal } from './helper';
import { Remote } from 'comlink';
import { Subject } from 'rxjs';

@Component({
  selector: 'ngx-image-manipulator',
  templateUrl: './image-manipulator.component.html',
  styleUrls: ['./image-manipulator.component.css'],
})
export class ImageManipulatorComponent<T extends ImageManipulator>
  implements OnInit
{
  private comlinkObj: Remote<T> | undefined = undefined;
  private sub: Subject<number> = new Subject<number>();
  public currentProgress: number = 0;
  constructor(
    @Inject(IMAGEMANIPULATION_WEBWORKER_FACTORY)
    private readonly workerFactory: () => Worker
  ) {
    this.sub.subscribe((num) => (this.currentProgress = num));
  }

  async ngOnInit() {
    this.comlinkObj = await initLocal<T>(this.workerFactory, this.sub);
  }

  public retrieveManipulator(): Remote<T> {
    if (this.comlinkObj == null) {
      throw new Error('Image Manipulator object is not initialized.');
    }
    return this.comlinkObj;
  }
}
