import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { IMAGEMANIPULATION_WEBWORKER_FACTORY } from './helper/worker-factory';
import { ImageManipulator, initLocal, InstantiationError } from './helper';
import { Remote } from 'comlink';
import { Subject } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

interface Class<T> {
  new (...args: any[]): T;
}

@Component({
  selector: 'ngx-image-manipulator',
  templateUrl: './image-manipulator.component.html',
  styleUrls: ['./image-manipulator.component.css'],
})
export class ImageManipulatorComponent<T extends ImageManipulator>
  implements OnInit, AfterViewInit
{
  @Input()
  public manipulatorClass: Class<T> | null = null;

  public _pictureInput: string | Blob | ImageData | null = null;

  public imgElementSrc: string | SafeUrl = '';
  public _transformedImageData: ImageData | null = null;

  @Input()
  set pictureInput(data: string | Blob | ImageData | null) {
    this._pictureInput = data;
    if (this._pictureInput instanceof Blob) {
      const objurl = URL.createObjectURL(data);
      this.imgElementSrc = this.sanitizer.bypassSecurityTrustUrl(objurl);
    }
  }

  @ViewChild('imgElement')
  public imgEl: ElementRef<HTMLImageElement> | null = null;

  @ViewChild('canvasHelper')
  public _canvasHelper: ElementRef<HTMLCanvasElement> | null = null;
  @ViewChild('canvasElement')
  public canvasEl: ElementRef<HTMLCanvasElement> | null = null;

  @Output()
  public readyToTransform: EventEmitter<void> = new EventEmitter<void>();

  private remoteWorker: Remote<T> | null = null;

  private sub: Subject<number> = new Subject<number>();
  private currentProgress: number = 0;

  constructor(
    @Inject(IMAGEMANIPULATION_WEBWORKER_FACTORY)
    private readonly workerFactory: () => Worker,
    private readonly sanitizer: DomSanitizer
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

  ngAfterViewInit() {
    if (this.imgEl == null) {
      throw new InstantiationError('Img Element was not loaded');
    }

    this.imgEl.nativeElement.onload = () => {
      this.canvasHelper.width = this.imgHelper.width;
      this.canvasHelper.height = this.imgHelper.height;
      this.canvasHelperContext.drawImage(this.imgHelper, 0, 0);
      this._transformedImageData = this.canvasHelperContext.getImageData(
        0,
        0,
        this.canvasHelper.width,
        this.canvasHelper.height
      );
      this.readyToTransform.next();
    };
  }

  public async startTransform(
    transform: (data: ImageData) => Promise<ImageData>
  ): Promise<void> {
    this.remoteWorker?.stop();

    if (this._transformedImageData != null && this.canvasEl != null) {
      const imageData = await transform(this._transformedImageData);
      const context = this.canvasEl.nativeElement.getContext('2d');
      this.canvasEl.nativeElement.width = imageData.width;
      this.canvasEl.nativeElement.height = imageData.height;
      if (context != null) {
        context.putImageData(imageData, 0, 0);
      }
    }
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

  private get canvasHelper(): HTMLCanvasElement {
    if (this._canvasHelper == null) {
      throw new Error('Could not retrieve Canvas Helper Context');
    }
    return this._canvasHelper.nativeElement;
  }
  private get canvasHelperContext(): CanvasRenderingContext2D {
    const context = this.canvasHelper.getContext('2d');
    if (context == null) {
      throw new Error('Could not retrieve Canvas Helper Context.');
    }
    return context;
  }

  private get imgHelper(): HTMLImageElement {
    if (this.imgEl == null) {
      throw new Error('Could not retrieve Image Helper.');
    }
    return this.imgEl.nativeElement;
  }
}
