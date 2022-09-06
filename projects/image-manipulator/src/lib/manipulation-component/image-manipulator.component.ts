import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { Observable } from 'rxjs';
import {
  transformBase64ToImageData,
  transformBlobToImageData,
} from '../helper';

@Component({
  selector: 'ngx-image-manipulator',
  templateUrl: './image-manipulator.component.html',
  styleUrls: ['./image-manipulator.component.css'],
})
export class ImageManipulatorComponent {
  /**
   * The given data can be a base64 string, a Blob/File or ImageData.
   * In all cases you should wait with starting the transform, until the readyToTransform Event has
   * emitted true, which means that the internal conversion of the input data to ImageData is finished.
   * Important: This method is not safe from XSS Injection. You should not pass untrusted strings to this method!
   */
  @Input()
  public pictureData: string | ImageData | Blob | null = null;

  @Input()
  public hide: boolean = true;

  @Output()
  public finishedTransform: EventEmitter<ImageData> = new EventEmitter<ImageData>();

  private _isTransforming: boolean = false;
  private _currentProgress: number = 0;

  @ViewChild('canvasElement')
  public _canvasElement: ElementRef<HTMLCanvasElement> | null = null;

  constructor() {}

  public async startTransform(
    transform: (data: ImageData) => Promise<ImageData>,
    progress: Observable<number>
  ): Promise<void> {
    if (this.pictureData == null) {
      throw new Error('No image data available for transformation.');
    }

    let imageDataToTransform: ImageData | null = null;
    if (typeof this.pictureData === 'string') {
      imageDataToTransform = await transformBase64ToImageData(this.pictureData);
    } else if (this.pictureData instanceof ImageData) {
      imageDataToTransform = this.pictureData;
    } else if (this.pictureData instanceof Blob) {
      imageDataToTransform = await transformBlobToImageData(this.pictureData);
    } else {
      throw new Error(
        'The given pictureData can not be converted to ImageData!'
      );
    }

    this._currentProgress = 0;
    const subscription = progress.subscribe(
      (progress) => (this._currentProgress = progress)
    );
    this._isTransforming = true;
    const finishedData = await transform(imageDataToTransform);
    this._isTransforming = false;
    this.canvasElement.width = finishedData.width;
    this.canvasElement.height = finishedData.height;
    this.canvasElementContext.putImageData(finishedData, 0, 0);
    this.finishedTransform.next(finishedData);
    subscription.unsubscribe();
  }

  public getCurrentProgress(): number {
    return this._currentProgress;
  }

  public isTransforming(): boolean {
    return this._isTransforming;
  }

  private get canvasElement(): HTMLCanvasElement {
    if (this._canvasElement == null) {
      throw new Error('Could not retrieve Canvas Helper.');
    }
    return this._canvasElement.nativeElement;
  }

  private get canvasElementContext(): CanvasRenderingContext2D {
    const context = this.canvasElement.getContext('2d');
    if (context == null) {
      throw new Error('Could not retrieve Canvas Helper Context.');
    }
    return context;
  }
}
