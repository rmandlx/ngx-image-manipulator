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
  public outputType: 'imageBitmap' | 'imageData' = 'imageData';

  @Output()
  public transformedData: EventEmitter<ImageData | ImageBitmap> =
    new EventEmitter<ImageData | ImageBitmap>();

  @Output()
  public currentlyTransforming: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild('progressDiv')
  public progressDiv: ElementRef<HTMLDivElement> | null = null;

  private _isTransforming: boolean = false;
  private _currentProgress: number = 0;

  constructor() {
    this.currentlyTransforming.next(false);
  }

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
    if (this.progressDiv != null) {
      this.progressDiv.nativeElement.style.width = '0%';
    }
    const subscription = progress.subscribe((progress) => {
      this._currentProgress = progress;
      if (this.progressDiv != null) {
        this.progressDiv.nativeElement.style.width = progress + '%';
      }
    });
    this._isTransforming = true;
    this.currentlyTransforming.next(true);
    try {
      const finishedData = await transform(imageDataToTransform);

      if (this.outputType === 'imageData') {
        this.transformedData.next(finishedData);
      } else if (this.outputType === 'imageBitmap') {
        const offscreenCanvas = new OffscreenCanvas(
          finishedData.width,
          finishedData.height
        );
        const offscreenCanvasContext = offscreenCanvas.getContext('2d');
        if (offscreenCanvasContext == null) {
          throw new Error('Could not get 2d context from Offscreen Canvas.');
        }
        offscreenCanvasContext.putImageData(finishedData, 0, 0);
        this.transformedData.next(offscreenCanvas.transferToImageBitmap());
      }
    } finally {
      // Makes sure that the transformation is declared as stopped, even if transform might throw errors
      this.currentlyTransforming.next(false);
      this._isTransforming = false;
      subscription.unsubscribe();
    }
  }

  public getCurrentProgress(): number {
    return this._currentProgress;
  }

  public isTransforming(): boolean {
    return this._isTransforming;
  }
}
