import { Component, Inject, Input, OnInit } from '@angular/core';
import { IMAGEMANIPULATION_WEBWORKER_FACTORY } from './helper/worker-factory';
import { ImageManipulator, initLocal, InstantiationError } from './helper';
import { Remote } from 'comlink';
import { Subject } from 'rxjs';

interface Class<T> {
  new (...args: any[]): T;
}

@Component({
  selector: 'ngx-image-manipulator',
  templateUrl: './image-manipulator.component.html',
  styleUrls: ['./image-manipulator.component.css'],
})
export class ImageManipulatorComponent<T extends ImageManipulator>
  implements OnInit
{
  @Input()
  public manipulatorClass: Class<T> | null = null;

  public _imageData: string | Blob | ImageData | null = null;

  @Input()
  set imageData(data: string | Blob | ImageData | null) {
    this._imageData = data;
  }

  public _transform: ((data: ImageData) => ImageData) | null = null;
  @Input()
  set transform(transform: ((data: ImageData) => ImageData) | null) {
    this._transform = transform;
  }

  private remoteWorker: Remote<T> | null = null;

  private sub: Subject<number> = new Subject<number>();
  private currentProgress: number = 0;

  constructor(
    @Inject(IMAGEMANIPULATION_WEBWORKER_FACTORY)
    private readonly workerFactory: () => Worker
  ) {
    this.sub.subscribe((num) => (this.currentProgress = num));
  }

  async ngOnInit() {
    if (this.manipulatorClass == null) {
      throw new InstantiationError(
        'Could not create ImageManipulator because no Manipulator Class was given as Input!'
      );
    }

    const copyManipulatorClass = this.manipulatorClass;
    const manipulatorFactory = () => new copyManipulatorClass();

    this.remoteWorker = await initLocal<T>(
      this.workerFactory,
      manipulatorFactory,
      this.sub
    );
  }

  public retrieveManipulator(): Remote<T> {
    console.log('retrieved manipulator');
    if (this.remoteWorker == null) {
      throw new Error('Image Manipulator object is not initialized.');
    }
    return this.remoteWorker;
  }

  public getCurrentProgress(): number {
    return this.currentProgress;
  }

  public isInitialized(): boolean {
    return this.remoteWorker != null;
  }
}
