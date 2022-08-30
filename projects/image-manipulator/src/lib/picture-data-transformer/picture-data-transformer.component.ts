import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TransformationOptions } from './transformation-options';

@Component({
  selector: 'malen-app-image-transformer',
  templateUrl: './picture-data-transformer.component.html',
  styleUrls: ['./picture-data-transformer.component.css'],
})
export class PictureDataTransformerComponent
  implements OnDestroy, AfterViewInit, DoCheck
{
  @ViewChild('canvasElement')
  _canvas: ElementRef<HTMLCanvasElement> | null = null;
  @ViewChild('canvasHelper')
  _canvasHelper: ElementRef<HTMLCanvasElement> | null = null;
  @ViewChild('imgElement')
  _imgElement: ElementRef<HTMLImageElement> | null = null;

  @Input()
  transformationOptions: TransformationOptions | null = null;

  _imageUrl: string | null = null;
  _imageUrlSafe: SafeUrl | null = null;

  @Output()
  conversionFinished: EventEmitter<Blob | ImageData | string> =
    new EventEmitter<Blob | ImageData | string>();

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly changeDetector: ChangeDetectorRef
  ) {}

  async ngDoCheck() {
    if (
      this.transformationOptions != null &&
      this.transformationOptions.hasChanged() &&
      this.transformationOptions.isComplete()
    ) {
      this.cleanup();
      const data = this.transformationOptions.getInputDataSafe();
      if (data instanceof ImageData) {
        await this.drawToCanvas(data, this.transformationOptions.getResize());
      } else if (data instanceof Blob) {
        this._imageUrl = URL.createObjectURL(data);
        this._imageUrlSafe = this.sanitizer.bypassSecurityTrustUrl(
          this._imageUrl
        );
      } else if (typeof data === 'string') {
        const data = this.transformationOptions.getInputDataSafe() as string;
        if (data.includes(';base64')) {
          this._imageUrl = data;
        } else {
          this._imageUrl = 'data:image;base64,' + data;
        }
        this._imageUrlSafe = this.sanitizer.bypassSecurityTrustUrl(
          this._imageUrl
        );
      }
    }
  }

  ngAfterViewInit() {
    this.imgElement.onload = async () => {
      if (this.transformationOptions == null) {
        return;
      }

      this.canvasHelper.width = this.imgElement.width;
      this.canvasHelper.height = this.imgElement.height;
      this.canvasHelperContext.drawImage(this.imgElement, 0, 0);
      await this.drawToCanvas(
        this.canvasHelperContext.getImageData(
          0,
          0,
          this.canvasHelper.width,
          this.canvasHelper.height
        ),
        this.transformationOptions.getResize()
      );
    };
    this.imgElement.onerror = () => {
      if (this._imageUrlSafe != null) {
        //TODO: Throw event?
        console.log('Couldnt load image');
      }
    };
  }

  ngOnDestroy() {
    this.cleanup();
  }

  private async drawToCanvas(
    data: ImageData,
    resize: { pixelsX: number; pixelsY: number } | null
  ) {
    this.canvas.width = data.width;
    this.canvas.height = data.height;
    this.canvasHelper.width = data.width;
    this.canvasHelper.height = data.height;
    this.canvasHelperContext.putImageData(data, 0, 0);
    if (resize != null) {
      this.canvas.width = resize.pixelsX;
      this.canvas.height = resize.pixelsY;
      this.canvasContext.drawImage(
        this.canvasHelper,
        0,
        0,
        resize.pixelsX,
        resize.pixelsY
      );
    } else {
      this.canvasContext.drawImage(this.canvasHelper, 0, 0);
    }

    if (this.transformationOptions != null) {
      if (this.transformationOptions.getOutputFormat() === 'blob') {
        const blob = await this.base64ToBlob(this.canvas.toDataURL());
        this.conversionFinished.next(blob);
      } else if (this.transformationOptions.getOutputFormat() === 'imageData') {
        this.conversionFinished.next(
          this.canvasContext.getImageData(
            0,
            0,
            this.canvas.width,
            this.canvas.height
          )
        );
      } else if (this.transformationOptions.getOutputFormat() === 'base64') {
        this.conversionFinished.next(this.canvas.toDataURL());
      }
    }
  }

  private async base64ToBlob(base64: string): Promise<Blob> {
    return fetch(base64).then((res) => res.blob());
  }

  private cleanup() {
    if (this._imageUrl != null) {
      URL.revokeObjectURL(this._imageUrl);
    }
    this._imageUrl = null;
    this._imageUrlSafe = null;
  }

  // Safe Getters
  private get imgElement(): HTMLImageElement {
    if (this._imgElement == null) {
      throw new Error('Image nicht geladen!');
    }
    return this._imgElement.nativeElement;
  }

  private get canvas(): HTMLCanvasElement {
    if (this._canvas == null) {
      throw new Error('Canvas is undefined');
    }
    return this._canvas.nativeElement;
  }

  private get canvasContext(): CanvasRenderingContext2D {
    const context = this.canvas.getContext('2d');
    if (context == null) {
      throw new Error('Canvas context is undefined');
    }
    return context;
  }

  private get canvasHelper(): HTMLCanvasElement {
    if (this._canvasHelper == null) {
      throw new Error('Canvas is undefined');
    }
    return this._canvasHelper.nativeElement;
  }

  private get canvasHelperContext(): CanvasRenderingContext2D {
    const context = this.canvasHelper.getContext('2d');
    if (context == null) {
      throw new Error('Canvas context is undefined');
    }
    return context;
  }
}
